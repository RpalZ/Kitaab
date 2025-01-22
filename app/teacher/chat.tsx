import { FIREBASE_AUTH, db } from '@/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { ChatInput } from 'app/components/ChatInput';
import { COLORS } from 'app/styles/theme';
import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
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
  View,
} from 'react-native';
import { TeacherTabs } from '../components/TeacherTabs';
import { secureStorage } from "../utils/secureStorage";

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
  const userId = FIREBASE_AUTH.currentUser?.uid;

  // Add ref for FlatList
  const flatListRef = useRef<FlatList>(null);

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

  // Add message saving effect for current chat
  useEffect(() => {
    if (!userId || !currentChatId || messages.length === 0) return;

    const saveChatHistory = async () => {
      try {
        const chatRef = doc(db, 'users', userId, 'chats', currentChatId);
        await updateDoc(chatRef, {
          messages,
          lastUpdated: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error saving chat messages:', error);
      }
    };

    saveChatHistory();
  }, [messages, userId, currentChatId]);

  const handleSend = () => {
    if (message.trim()) {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: message.trim(),
        sender: 'user',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      setMessage('');

      // Simulate AI response (replace with actual API call later)
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: 'This is a placeholder response. API integration pending.',
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      }, 1000);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    // Convert timestamp to Date if it's a Firestore timestamp
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
          {item.text}
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

  // Add keyboard listener effect
  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      scrollToBottom
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  // Update scrollToBottom to be more reliable
  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      // Add a small delay to ensure content is laid out
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  // Add effect to scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add getItemLayout function to optimize FlatList rendering
  const getItemLayout = (data: any, index: number) => {
    const itemHeight = 90; // Approximate height of each message bubble
    return {
      length: itemHeight,
      offset: itemHeight * index,
      index,
    };
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
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
          getItemLayout={getItemLayout}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
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
    borderBottomColor: COLORS.border,
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
}); 