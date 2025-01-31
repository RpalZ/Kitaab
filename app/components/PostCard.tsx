import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Post } from '../types/forum';
import { COLORS } from '../styles/theme';
import { formatDistanceToNow } from 'date-fns';
import Ionicons from "@expo/vector-icons/Ionicons";

type PostCardProps = {
  post: Post;
  onPress: () => void;
};

export function PostCard({ post, onPress }: PostCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.authorName}>{post.authorName}</Text>
        <Text style={styles.timestamp}>
          {formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true })}
        </Text>
      </View>

      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.content} numberOfLines={3}>
        {post.content}
      </Text>

      <View style={styles.footer}>
        {post.files && post.files.length > 0 && (
          <View style={styles.filesInfo}>
            <Ionicons name="document-attach" size={16} color={COLORS.text.secondary} />
            <Text style={styles.filesCount}>{post.files.length} file(s)</Text>
          </View>
        )}

        <View style={styles.commentsInfo}>
          <Ionicons name="chatbubble-outline" size={16} color={COLORS.text.secondary} />
          <Text style={styles.commentsCount}>{post.commentCount || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  filesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  filesCount: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  commentsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentsCount: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
}); 