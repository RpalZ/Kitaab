import { FIREBASE_AUTH, db } from '@/FirebaseConfig';
import { DEEPSEEK_API_KEY } from '@env';
import { Ionicons } from '@expo/vector-icons';
import { ChatInput } from 'app/components/ChatInput';
import { COLORS } from 'app/styles/theme';
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import OpenAI from "openai";
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { TeacherTabs } from '../components/TeacherTabs';
import { secureStorage } from "../utils/secureStorage";
// import { chatStyles as styles } from "../styles/chat.styles";

//use firestore to store ai chats between accounts
//use collections to store the data: Map<userID, Map<chatID, chatPropertiesAndMessageHistory>>
//this collection will be stored in the firestore database
//use useEffects hooks to refresh the data
//chat history data is persistent goin on and off the page

// Update types to include chat ID and title
type Chat = {
  id: string;
  title: string;
  lastUpdated: Date;
  messages: Message[];
};

// Update Message type to handle both client and server timestamps
type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date | { seconds: number; nanoseconds: number };
};

type ChatHistory = {
  messages: Message[];
  lastUpdated: Date;
};

export default function TeacherChat() {
  const [activeTab, setActiveTab] = useState('chat');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [isSelectorVisible, setIsSelectorVisible] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const userId = FIREBASE_AUTH.currentUser?.uid;

  // Add ref for FlatList
  const flatListRef = useRef<FlatList>(null);

  // Add OpenAI configuration at the top level of the component
  const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: DEEPSEEK_API_KEY,
    dangerouslyAllowBrowser: true
  });

  // Load last active chat ID and all chats
  useEffect(() => {
    if (!userId) return;
    
    const loadChatsAndLastActive = async () => {
      try {
        // Load all chats first
        const chatsRef = collection(db, 'users', userId, 'chats');
        const querySnapshot = await getDocs(chatsRef);
        const loadedChats: Chat[] = [];
        
        querySnapshot.forEach((doc) => {
          const chatData = doc.data() as Chat;
          loadedChats.push({
            ...chatData,
            id: doc.id,
          });
        });
        
        // Get last active chat ID from storage
        const lastActiveChatId = await secureStorage.getItem(`lastActiveChat_${userId}`);
        
        // If no chats exist, create initial chat
        if (loadedChats.length === 0) {
          const newChatRef = doc(collection(db, 'users', userId, 'chats'));
          const initialChat: Chat = {
            id: newChatRef.id,
            title: 'Welcome Chat',
            lastUpdated: new Date(),
            messages: [{
              id: '1',
              text: 'Hello! I\'m your AI teaching assistant. How can I help you today?',
              sender: 'ai',
              timestamp: new Date(),
            }],
          };
          
          await setDoc(newChatRef, initialChat);
          loadedChats.push(initialChat);
        }
        
        setChats(loadedChats);
        
        // Set current chat ID to either last active chat (if it exists) or first chat
        const chatToLoad = lastActiveChatId && loadedChats.find(c => c.id === lastActiveChatId)
          ? lastActiveChatId
          : loadedChats[0].id;
          
        setCurrentChatId(chatToLoad);
        setMessages(loadedChats.find(c => c.id === chatToLoad)?.messages || []);
        
      } catch (error) {
        console.error('Error loading chats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadChatsAndLastActive();
  }, [userId]);

  // Save last active chat ID when it changes
  useEffect(() => {
    if (!userId || !currentChatId) return;
    
    secureStorage.setItem(`lastActiveChat_${userId}`, currentChatId);
  }, [currentChatId, userId]);

  // Create new chat
  const createNewChat = async () => {
    if (!userId) return;
    
    try {
      const newChatRef = doc(collection(db, 'users', userId, 'chats'));
      const newChat: Chat = {
        id: newChatRef.id,
        title: `Chat ${chats.length + 1}`,
        lastUpdated: new Date(),
        messages: [{
          id: '1',
          text: 'Hello! I\'m your AI teaching assistant. How can I help you today?',
          sender: 'ai',
          timestamp: new Date(),
        }],
      };
      
      await setDoc(newChatRef, newChat);
      setChats(prev => [...prev, newChat]);
      setCurrentChatId(newChat.id);
      setMessages(newChat.messages);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  // Update the header to include the new chat button and chat selector
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.chatSelectorButton}
        onPress={() => setIsSelectorVisible(true)}
      >
        <Text style={styles.title}>
          {chats.find(chat => chat.id === currentChatId)?.title || 'AI Assistant'}
        </Text>
        <Ionicons name="chevron-down" size={20} color={COLORS.text.light} />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.newChatButton}
        onPress={createNewChat}
      >
        <Ionicons name="add" size={24} color={COLORS.text.light} />
      </TouchableOpacity>
    </View>
  );

  // Add delete function
  const deleteChat = async (chatId: string) => {
    if (!userId) return;
    
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'users', userId, 'chats', chatId));
      
      // Update local state
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      
      // If the deleted chat was current, switch to another chat
      if (chatId === currentChatId) {
        const remainingChats = chats.filter(chat => chat.id !== chatId);
        if (remainingChats.length > 0) {
          setCurrentChatId(remainingChats[0].id);
          setMessages(remainingChats[0].messages);
        } else {
          setCurrentChatId('');
          setMessages([]);
        }
      }
      
      // Close modal if no chats left
      if (chats.length <= 1) {
        setIsSelectorVisible(false);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  // Update the chat selector modal render function
  const renderChatSelector = () => (
    <Modal
      visible={isSelectorVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setIsSelectorVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Chat</Text>
          <FlatList
            data={chats}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.chatItemContainer}>
                <TouchableOpacity
                  style={styles.chatItem}
                  onPress={() => {
                    setCurrentChatId(item.id);
                    setMessages(item.messages);
                    setIsSelectorVisible(false);
                  }}
                >
                  <Text style={styles.chatItemText}>{item.title}</Text>
                  <Text style={styles.chatItemDate}>
                    {new Date(item.lastUpdated).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteChat(item.id)}
                >
                  <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            )}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsSelectorVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Load messages when chat changes
  useEffect(() => {
    if (!userId || !currentChatId) return;
    loadMessages();
  }, [currentChatId]);

  const loadMessages = async () => {
    if (!userId || !currentChatId) return;
    
    try {
      setLoading(true);
      
      // First, check if the chat exists
      const chatRef = doc(db, `users/${userId}/chats/${currentChatId}`);
      const chatDoc = await getDoc(chatRef);
      
      if (!chatDoc.exists()) {
        // If chat doesn't exist, create it with welcome message
        const welcomeMessage: Message = {
          id: '1',
          text: "Hello! I'm your AI teaching assistant. How can I help you today?",
          sender: 'ai',
          timestamp: new Date()
        };
        
        await setDoc(chatRef, {
          title: `Chat ${currentChatId}`,
          lastUpdated: serverTimestamp(),
          messages: [welcomeMessage]
        });
        
        // Set initial message
        setMessages([welcomeMessage]);
        setLoading(false);
        return;
      }
      
      // Then load messages
      const messagesRef = collection(db, `users/${userId}/chats/${currentChatId}/messages`);
      const q = query(messagesRef, orderBy('timestamp', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const loadedMessages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      
      // If no messages exist, add welcome message
      if (loadedMessages.length === 0) {
        const welcomeMessage: Message = {
          id: '1',
          text: "Hello! I'm your AI teaching assistant. How can I help you today?",
          sender: 'ai',
          timestamp: new Date()
        };
        
        await saveMessage(welcomeMessage);
        setMessages([welcomeMessage]);
      } else {
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update saveMessage to handle return type
  const saveMessage = async (message: Message): Promise<Message | undefined> => {
    if (!userId || !currentChatId) return undefined;
    
    try {
      const messageRef = doc(collection(db, `users/${userId}/chats/${currentChatId}/messages`));
      const messageWithId = {
        ...message,
        id: messageRef.id,
        timestamp: serverTimestamp()
      };
      
      await setDoc(messageRef, messageWithId);
      
      const chatRef = doc(db, `users/${userId}/chats/${currentChatId}`);
      await setDoc(chatRef, {
        lastUpdated: serverTimestamp()
      }, { merge: true });
      
      // Return message with client timestamp for immediate display
      return {
        ...messageWithId,
        timestamp: new Date() // Use client timestamp for UI
      };
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  };

  // Update scrollToBottom to handle large messages better
  const scrollToBottom = (withDelay = false) => {
    if (!flatListRef.current || messages.length === 0) return;

    const scroll = () => {
      // First scroll without animation to ensure we get to the bottom
      flatListRef.current?.scrollToOffset({ offset: 999999, animated: false });
      
      // Then do an animated scroll with a delay to ensure content is rendered
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 999999, animated: true });
      }, 100);
    };

    if (withDelay) {
      // Add extra delay for large messages
      setTimeout(scroll, 200);
    } else {
      scroll();
    }
  };

  // Update message effects
  useEffect(() => {
    scrollToBottom(true); // Use delay when messages change
  }, [messages]);

  // Add keyboard handler function
  const handleKeyboardHide = () => {
    scrollToBottom(true);
  };

  // Update keyboard listener effect
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      handleKeyboardHide
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  // Add getItemLayout function to optimize FlatList rendering
  const getItemLayout = (data: any, index: number) => {
    const itemHeight = 100; // Approximate height of each message bubble
    return {
      length: itemHeight,
      offset: itemHeight * index,
      index,
    };
  };

  // Add specific handlers for FlatList events
  const handleContentSizeChange = (w: number, h: number) => {
    scrollToBottom(true);
  };

  const handleLayout = () => {
    scrollToBottom(true);
  };

  // Update handleSend to handle undefined returns
  const handleSend = async (text: string) => {
    if (!text.trim() || isAiResponding || !userId) return;
    
    setIsAiResponding(true);
    
    try {
      let chatId = currentChatId;
      if (!chatId) {
        chatId = Date.now().toString();
        const chatRef = doc(db, `users/${userId}/chats/${chatId}`);
        
        // Create initial welcome message
        const welcomeMessage: Message = {
          id: '1',
          text: "Hello! I'm your AI teaching assistant. How can I help you today?",
          sender: 'ai',
          timestamp: new Date()
        };

        await setDoc(chatRef, {
          id: chatId,
          title: `Chat ${chatId}`,
          lastUpdated: serverTimestamp(),
          messages: [welcomeMessage]
        });
        
        setCurrentChatId(chatId);
        setMessages([welcomeMessage]);
      }
      
      const userMessage: Message = {
        id: Date.now().toString(),
        text: text.trim(),
        sender: 'user',
        timestamp: new Date()
      };

      const savedUserMessage = await saveMessage(userMessage);
      if (savedUserMessage) {
        setMessages(prev => [...prev, savedUserMessage]);
      }

      try {
        const completion = await openai.chat.completions.create({
          messages: [{ role: "user", content: text }],
          model: "deepseek-chat",
        });

        const aiResponse = completion.choices[0]?.message?.content || "Sorry, I couldn't process that.";
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: aiResponse,
          sender: 'ai',
          timestamp: new Date()
        };
        
        const savedAiMessage = await saveMessage(aiMessage);
        if (savedAiMessage) {
          setMessages(prev => [...prev, savedAiMessage]);
        }
      } catch (error) {
        console.error('Error getting AI response:', error);
      }
    } catch (error) {
      console.error('Error in chat sequence:', error);
    } finally {
      setIsAiResponding(false);
    }
  };

  // formatting 
  const formatText = (text: string) => {
    const segments = text.split(/(\*\*.*?\*\*|\*.*?\*|```.*?```)/g).filter(Boolean);

    return segments.map((segment, index) => {
      if (segment.startsWith('**') && segment.endsWith('**')) {
        // Bold text
        return (
          <Text key={index} style={styles.boldText}>
            {segment.slice(2, -2)}
          </Text>
        );
      } else if (segment.startsWith('*') && segment.endsWith('*')) {
        // Italic text
        return (
          <Text key={index} style={styles.italicText}>
            {segment.slice(1, -1)}
          </Text>
        );
      } else if (segment.startsWith('```') && segment.endsWith('```')) {
        // Code block
        return (
          <View key={index} style={styles.codeBlock}>
            <Text style={styles.codeText}>
              {segment.slice(3, -3)}
            </Text>
          </View>
        );
      }
      // Regular text
      return <Text key={index}>{segment}</Text>;
    });
  };

  // using formattext
  const renderMessage = ({ item }: { item: Message }) => {
    const messageDate = item.timestamp instanceof Date 
      ? item.timestamp 
      : new Date((item.timestamp as any).seconds * 1000);

    return (
      <View
        style={[
          styles.messageBubble,
          item.sender === 'user' ? styles.userMessage : styles.aiMessage,
        ]}
      >
        <Text style={[
          styles.messageText,
          item.sender === 'user' ? styles.userMessageText : styles.aiMessageText,
        ]}>
          {formatText(item.text)}
        </Text>
        <Text style={styles.timestamp}>
          {messageDate.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderChatSelector()}

      <View style={styles.contentContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => scrollToBottom(true)}
          onLayout={() => scrollToBottom(true)}
          removeClippedSubviews={false}
          maxToRenderPerBatch={5}
          windowSize={5}
          initialNumToRender={10}
          onEndReachedThreshold={0.5}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ChatInput 
            message={message}
            onChangeText={setMessage}
            onSend={handleSend}
            isLoading={isAiResponding}
          />
        </KeyboardAvoidingView>
      </View>

      <TeacherTabs activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    flex: 1,
    marginBottom: Platform.OS === 'ios' ? 80 : 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 24,
  },
  chatSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  newChatButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.light,
  },
  messageList: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
    borderTopRightRadius: 4,
  },
  aiMessage: {
    backgroundColor: COLORS.card.primary,
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: COLORS.text.light,
  },
  aiMessageText: {
    color: COLORS.text.primary,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.card.primary,
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  chatItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
  },
  chatItem: {
    flex: 1,
    padding: 16,
  },
  chatItemText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  chatItemDate: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.text.light,
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
  italicText: {
    fontStyle: 'italic',
  },
  codeBlock: {
    backgroundColor: COLORS.card.secondary,
    padding: 8,
    borderRadius: 4,
    marginVertical: 4,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    color: COLORS.text.primary,
  },
}); 