import { Ionicons } from '@expo/vector-icons';
import { COLORS } from 'app/styles/theme';
import { ActivityIndicator, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

type ChatInputProps = {
  message: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  isLoading?: boolean;
};

export function ChatInput({ message, onChangeText, onSend, isLoading }: ChatInputProps) {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        value={message}
        onChangeText={onChangeText}
        placeholder="Type your message..."
        placeholderTextColor={COLORS.text.secondary}
        multiline
      />
      <TouchableOpacity 
        style={styles.sendButton}
        onPress={onSend}
        disabled={!message.trim() || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.text.light} />
        ) : (
          <Ionicons 
            name="send" 
            size={24} 
            color={message.trim() ? COLORS.primary : COLORS.text.secondary} 
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: COLORS.card.primary,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    color: COLORS.text.primary,
  },
  sendButton: {
    padding: 8,
  },
  inputDisabled: {
    opacity: 0.7,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
}); 