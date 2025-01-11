import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface, IconButton } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';

interface DocumentUploadProps {
  onUpload: (document: any) => void;
}

export default function DocumentUpload({ onUpload }: DocumentUploadProps) {
  const [documents, setDocuments] = useState<any[]>([]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
      });

      if (!result.canceled && result.assets) {
        setDocuments([...documents, result.assets[0]]);
        onUpload(result.assets[0]);
      }
    } catch (error) {
      alert('Error uploading document');
    }
  };

  return (
    <Surface style={styles.container}>
      <Text style={styles.title}>Upload Documents</Text>
      <Button
        mode="outlined"
        icon="file-upload"
        onPress={pickDocument}
        style={styles.uploadButton}
        labelStyle={{ color: '#007BFF' }}
      >
        Upload Document
      </Button>

      {documents.map((doc, index) => (
        <View key={index} style={styles.documentItem}>
          <Text numberOfLines={1} style={styles.documentName}>
            {doc.name}
          </Text>
          <IconButton
            icon="close"
            size={20}
            onPress={() => {
              const newDocs = [...documents];
              newDocs.splice(index, 1);
              setDocuments(newDocs);
            }}
            iconColor="#dc3545"
          />
        </View>
      ))}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000000',
  },
  uploadButton: {
    marginBottom: 16,
    borderColor: '#007BFF',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  documentName: {
    flex: 1,
    marginRight: 8,
  }
});
