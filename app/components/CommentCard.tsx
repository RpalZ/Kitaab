import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Comment } from '../types/forum';
import { COLORS, FONTS } from '../styles/theme';
import { formatDistanceToNow } from 'date-fns';
import Ionicons from "@expo/vector-icons/Ionicons";

type CommentCardProps = {
  comment: Comment;
  depth?: number;
  onReply: (comment: Comment) => void;
};

export function CommentCard({ comment, depth = 0, onReply }: CommentCardProps) {
  const maxDepth = 4;
  const indentation = Math.min(depth, maxDepth) * 20;

  return (
    <View style={[styles.container, { marginLeft: indentation }]}>
      <View style={styles.header}>
        <Text style={styles.author}>{comment.authorName}</Text>
        <Text style={styles.date}>
          {comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : ''}
        </Text>
      </View>

      <Text style={styles.content}>{comment.content}</Text>

      <TouchableOpacity 
        style={styles.replyButton} 
        onPress={() => onReply(comment)}
      >
        <Ionicons name="return-down-forward-outline" size={16} color={COLORS.text.secondary} />
        <Text style={styles.replyText}>Reply</Text>
      </TouchableOpacity>

      {comment.replies?.map((reply) => (
        <CommentCard 
          key={reply.id} 
          comment={reply} 
          depth={depth + 1}
          onReply={onReply}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.border,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  author: {
    color: COLORS.text.primary,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },
  date: {
    color: COLORS.text.secondary,
    fontSize: FONTS.sizes.xs,
  },
  content: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  replyText: {
    color: COLORS.text.secondary,
    fontSize: FONTS.sizes.xs,
  },
}); 