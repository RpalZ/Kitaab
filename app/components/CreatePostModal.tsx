import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { COLORS, FONTS } from '../styles/theme';
import { Post, Comment } from '../types/forum';
import { CommentCard } from './CommentCard';
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatDistanceToNow } from 'date-fns';
import * as WebBrowser from 'expo-web-browser';

type PostDetailModalProps = {
  visible: boolean;
  onClose: () => void;
  post: Post | null;
  onAddComment: (content: string, parentId: string | null) => Promise<void>;
  isSubmitting: boolean;
};

export function PostDetailModal({ 
  visible, 
  onClose, 
  post, 
  onAddComment,
  isSubmitting 
}: PostDetailModalProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

  useEffect(() => {
    if (!visible) {
      setNewComment('');
      setReplyingTo(null);
    }
  }, [visible]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    await onAddComment(newComment, replyingTo?.id || null);
    setNewComment('');
    setReplyingTo(null);
  };

  const handleFileOpen = async (fileUri: string) => {
    if (Platform.OS === 'web') {
      window.open(fileUri, '_blank');
    } else {
      try {
        await WebBrowser.openBrowserAsync(fileUri);
      } catch (error) {
        console.error('Error opening file:', error);
      }
    }
  };

  if (!post) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView style={styles.scrollView}>
            <View style={styles.header}>
              <View style={styles.authorInfo}>
                <Text style={styles.author}>{post.authorName}</Text>
                <Text style={styles.date}>
                  {post.createdAt ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.content}>{post.content}</Text>

            {post.files && post.files.length > 0 && (
              <View style={styles.filesContainer}>
                <Text style={styles.filesTitle}>Attachments:</Text>
                {post.files.map((file, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.fileItem}
                    onPress={() => handleFileOpen(file.uri)}
                  >
                    <Ionicons name="document" size={20} color={COLORS.text.secondary} />
                    <Text style={styles.fileName} numberOfLines={1}>
                      {file.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.commentsSection}>
              <Text style={styles.commentsTitle}>Comments</Text>
              
              {replyingTo && (
                <View style={styles.replyingToContainer}>
                  <Text style={styles.replyingToText}>
                    Replying to {replyingTo.authorName}
                  </Text>
                  <TouchableOpacity onPress={() => setReplyingTo(null)}>
                    <Ionicons name="close" size={20} color={COLORS.text.secondary} />
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.commentInput}>
                <TextInput
                  value={newComment}
                  onChangeText={setNewComment}
                  style={styles.input}
                  placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
                  placeholderTextColor={COLORS.text.secondary}
                  multiline
                  editable={!isSubmitting}
                />
                <TouchableOpacity
                  style={[styles.submitButton, (!newComment.trim() || isSubmitting) && styles.disabled]}
                  onPress={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={COLORS.text.light} size="small" />
                  ) : (
                    <Ionicons name="send" size={20} color={COLORS.text.light} />
                  )}
                </TouchableOpacity>
              </View>

              {post.comments?.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  onReply={(comment) => setReplyingTo(comment)}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.card.primary,
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  authorInfo: {
    flex: 1,
  },
  author: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text.primary,
  },
  date: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text.primary,
    padding: 16,
  },
  content: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    lineHeight: 24,
    padding: 16,
    paddingTop: 0,
  },
  filesContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  filesTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card.secondary,
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  fileName: {
    flex: 1,
    color: COLORS.text.primary,
    marginLeft: 8,
    fontSize: FONTS.sizes.sm,
  },
  commentsSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  commentsTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card.secondary,
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  replyingToText: {
    color: COLORS.text.secondary,
    fontSize: FONTS.sizes.sm,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.card.secondary,
    borderRadius: 8,
    padding: 12,
    color: COLORS.text.primary,
    fontSize: FONTS.sizes.sm,
    maxHeight: 100,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
}); 