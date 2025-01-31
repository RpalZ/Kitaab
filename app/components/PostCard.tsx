import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Post } from '../types/forum';
import { COLORS, FONTS } from '../styles/theme';
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatDistanceToNow } from 'date-fns';

type PostCardProps = {
  post: Post;
  onPress: () => void;
};

export function PostCard({ post, onPress }: PostCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.author}>{post.authorName}</Text>
        <Text style={styles.date}>
          {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : ''}
        </Text>
      </View>
      
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.content} numberOfLines={3}>
        {post.content}
      </Text>
      
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="chatbubble-outline" size={16} color={COLORS.text.secondary} />
          <Text style={styles.footerText}>{post.commentCount} comments</Text>
        </View>
        {post.files && post.files.length > 0 && (
          <View style={styles.footerItem}>
            <Ionicons name="attach" size={16} color={COLORS.text.secondary} />
            <Text style={styles.footerText}>{post.files.length} files</Text>
          </View>
        )}
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
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  title: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  content: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    color: COLORS.text.secondary,
    fontSize: FONTS.sizes.xs,
  },
}); 