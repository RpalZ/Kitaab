import { FIREBASE_AUTH, db } from '@/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { ChatInput } from 'app/components/ChatInput';
import { COLORS } from 'app/styles/theme';
import { collection, doc, getDocs, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { TeacherTabs } from '../components/TeacherTabs';

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

  // Load all chats for the user
  useEffect(() => {
    if (!userId) return;
    
    const loadChats = async () => {
      try {
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
        
        setChats(loadedChats);
        
        // Set the most recent chat as current if none selected
        if (!currentChatId && loadedChats.length > 0) {
          setCurrentChatId(loadedChats[0].id);
          setMessages(loadedChats[0].messages);
        }
      } catch (error) {
        console.error('Error loading chats:', error);
        // console.trace(error)
      }
    };
    
    loadChats();
  }, [userId]);

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

  // Add chat selector modal
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

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderChatSelector()}

      <View style={styles.contentContainer}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
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
  chatItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
}); 