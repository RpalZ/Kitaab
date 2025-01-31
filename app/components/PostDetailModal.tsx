import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { useState } from 'react';
import { Post, Comment } from '../types/forum';
import { COLORS } from '../styles/theme';
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

export function PostDetailModal({ visible, onClose, post, onAddComment, isSubmitting }: PostDetailModalProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);

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
          <View style={styles.header}>
            <Text style={styles.title}>{post.title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContainer}>
            <Text style={styles.authorInfo}>
              Posted by {post.authorName} • {formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true })}
            </Text>
            
            <Text style={styles.content}>{post.content}</Text>

            {post.files && post.files.length > 0 && (
              <View style={styles.filesContainer}>
                {post.files.map((file, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.fileItem}
                    onPress={() => handleFileOpen(file.uri)}
                  >
                    <Ionicons name="document-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.fileName}>{file.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.commentsSection}>
              <Text style={styles.commentsTitle}>
                Comments ({post.commentCount || 0})
              </Text>

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

              {post.comments?.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  onReply={() => setReplyingTo(comment)}
                />
              ))}
            </View>
          </ScrollView>

          <View style={styles.commentInput}>
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
              placeholderTextColor={COLORS.text.secondary}
              editable={!isSubmitting}
            />
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.disabled]}
              onPress={handleSubmitComment}
              disabled={isSubmitting}
            >
              <Ionicons name="send" size={24} color={COLORS.text.light} />
            </TouchableOpacity>
          </View>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    flex: 1,
    marginRight: 16,
  },
  closeButton: {
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  authorInfo: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 12,
  },
  content: {
    fontSize: 16,
    color: COLORS.text.primary,
    lineHeight: 24,
    marginBottom: 16,
  },
  filesContainer: {
    marginBottom: 16,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card.secondary,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileName: {
    marginLeft: 8,
    color: COLORS.text.primary,
    fontSize: 14,
  },
  commentsSection: {
    marginTop: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card.secondary,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyingToText: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.card.primary,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.card.secondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    color: COLORS.text.primary,
    maxHeight: 100,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
}); 