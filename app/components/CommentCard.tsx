import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Comment } from '../types/forum';
import { COLORS } from '../styles/theme';
import { formatDistanceToNow } from 'date-fns';
import Ionicons from "@expo/vector-icons/Ionicons";

type CommentCardProps = {
  comment: Comment;
  onReply: () => void;
};

export function CommentCard({ comment, onReply }: CommentCardProps) {
  return (
    <View style={[styles.container, comment.parentId && styles.replyContainer]}>
      <View style={styles.header}>
        <Text style={styles.authorName}>{comment.authorName}</Text>
        <Text style={styles.timestamp}>
          {formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true })}
        </Text>
      </View>
      
      <Text style={styles.content}>{comment.content}</Text>
      
      <TouchableOpacity style={styles.replyButton} onPress={onReply}>
        <Ionicons name="return-up-back" size={16} color={COLORS.text.secondary} />
        <Text style={styles.replyText}>Reply</Text>
      </TouchableOpacity>

      {comment.replies && comment.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              onReply={onReply}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card.secondary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  replyContainer: {
    marginLeft: 24,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  content: {
    fontSize: 14,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  replyText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  repliesContainer: {
    marginTop: 12,
  },
}); 