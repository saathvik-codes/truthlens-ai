import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Image as ImageIcon, Video, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import CredibilityScore from '../components/CredibilityScore';
import ExplainabilityView from '../components/ExplainabilityView';
import KnowledgeGraph from '../components/KnowledgeGraph';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Analysis = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleTextAnalysis = async () => {
    if (!textInput.trim()) {
      toast.error('Please enter some text to analyze');
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const response = await axios.post(`${API}/analyze-text`, {
        text: textInput,
        check_sources: true
      });

      setResult(response.data);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Text analysis error:', error);
      toast.error('Analysis failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileAnalysis = async (type) => {
    if (!selectedFile) {
      toast.error('Please select a file to analyze');
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const endpoint = type === 'image' ? '/analyze-image' : '/analyze-video';
      const response = await axios.post(`${API}${endpoint}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult(response.data);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('File analysis error:', error);
      toast.error('Analysis failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      toast.success(`File selected: ${file.name}`);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      toast.success(`File selected: ${file.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6" data-testid="analysis-page">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold cabinet-grotesk mb-2">Content Analysis</h1>
          <p className="text-base text-gray-600">Upload or paste content for multimodal misinformation detection</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="text" data-testid="tab-text">
                  <FileText className="w-4 h-4 mr-2" />
                  Text
                </TabsTrigger>
                <TabsTrigger value="image" data-testid="tab-image">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Image
                </TabsTrigger>
                <TabsTrigger value="video" data-testid="tab-video">
                  <Video className="w-4 h-4 mr-2" />
                  Video
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" data-testid="text-input-section">
                <div className="space-y-4">
                  <label className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                    Paste Text Content
                  </label>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Paste news article, social media post, or any text content here..."
                    className="w-full h-64 p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 resize-none"
                    data-testid="text-input-textarea"
                  />
                  <Button
                    onClick={handleTextAnalysis}
                    disabled={analyzing || !textInput.trim()}
                    className="w-full bg-black hover:bg-gray-800 text-white py-6"
                    data-testid="analyze-text-btn"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Text'
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="image" data-testid="image-upload-section">
                <div className="space-y-4">
                  <label className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                    Upload Image
                  </label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    className={`upload-zone ${dragOver ? 'drag-over' : ''} p-12 text-center`}
                    data-testid="image-upload-zone"
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-base font-medium mb-2">Drag and drop image here</p>
                    <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="image-upload"
                      data-testid="image-file-input"
                    />
                    <label htmlFor="image-upload">
                      <Button variant="outline" className="cursor-pointer" asChild>
                        <span>Select Image</span>
                      </Button>
                    </label>
                  </div>
                  {selectedFile && (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">Selected: {selectedFile.name}</p>
                    </div>
                  )}
                  <Button
                    onClick={() => handleFileAnalysis('image')}
                    disabled={analyzing || !selectedFile}
                    className="w-full bg-black hover:bg-gray-800 text-white py-6"
                    data-testid="analyze-image-btn"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Image'
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="video" data-testid="video-upload-section">
                <div className="space-y-4">
                  <label className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                    Upload Video
                  </label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    className={`upload-zone ${dragOver ? 'drag-over' : ''} p-12 text-center`}
                    data-testid="video-upload-zone"
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-base font-medium mb-2">Drag and drop video here</p>
                    <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="video-upload"
                      data-testid="video-file-input"
                    />
                    <label htmlFor="video-upload">
                      <Button variant="outline" className="cursor-pointer" asChild>
                        <span>Select Video</span>
                      </Button>
                    </label>
                  </div>
                  {selectedFile && (
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-700">Selected: {selectedFile.name}</p>
                    </div>
                  )}
                  <Button
                    onClick={() => handleFileAnalysis('video')}
                    disabled={analyzing || !selectedFile}
                    className="w-full bg-black hover:bg-gray-800 text-white py-6"
                    data-testid="analyze-video-btn"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Video'
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-50 border border-gray-200 rounded-lg p-6"
          >
            {!result && !analyzing && (
              <div className="flex flex-col items-center justify-center h-full text-center py-16" data-testid="results-placeholder">
                <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-medium cabinet-grotesk mb-2">No Analysis Yet</h3>
                <p className="text-sm text-gray-500">Upload content to see detailed analysis results</p>
              </div>
            )}

            {analyzing && (
              <div className="flex flex-col items-center justify-center h-full py-16" data-testid="analyzing-loader">
                <Loader2 className="w-16 h-16 text-blue-900 animate-spin mb-4" />
                <h3 className="text-xl font-medium cabinet-grotesk mb-2">Analyzing Content</h3>
                <p className="text-sm text-gray-500">Running AI ensemble detection...</p>
              </div>
            )}

            {result && (
              <div className="space-y-6" data-testid="analysis-results">
                <CredibilityScore score={result.credibility_score} prediction={result.prediction} />
                <ExplainabilityView result={result} />
                {result.knowledge_graph && <KnowledgeGraph data={result.knowledge_graph} />}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;