import React, { useState } from 'react';
import { Button, Input, Card, Typography, List, Tag, notification, Progress } from 'antd';
import { SendOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { ScoringService } from '@/features/scoring/services/scoring.service';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

interface AIResponse {
    score: number;
    feedback: string;
    corrections: { original: string; corrected: string; explanation: string }[];
    betterVersion: string;
}

const ScoringPage: React.FC = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AIResponse | null>(null);
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    const handleAnalyze = async () => {
        if (!text.trim()) return;

        // Validate length client-side cơ bản
        if (text.length < 10) {
            notification.warning({ message: 'Text too short', description: 'Please enter at least 10 characters.' });
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const data = await ScoringService.checkIelts(text);
            setResult(data.data);
            notification.success({ message: 'Analysis Complete!', description: 'Check your results below.' });
        } catch (error: any) {
            if (error.response && error.response.status === 429) {
                notification.error({
                    message: 'Daily Limit Exceeded',
                    description: (
                        <div>
                            You have reached the guest limit (3 requests/day).
                            <Button type="link" size="small" onClick={() => navigate('/login')}>
                                Login for unlimited access
                            </Button>
                        </div>
                    ),
                    duration: 5,
                });
            } else {
                notification.error({ message: 'Error', description: 'Ensure your backend is running or try again later.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="text-center mb-8">
                <Title level={2}>BandMates AI</Title>
                <Paragraph type="secondary">
                    Your personal AI writing coach. Get instant feedback on your English writing.
                    {!isAuthenticated && <Tag color="orange" className="ml-2">Guest Mode (Max 3/day)</Tag>}
                </Paragraph>
            </div>

            <Card className="shadow-md mb-8">
                <TextArea
                    rows={6}
                    placeholder="Type or paste your English text here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="mb-4 text-base"
                />
                <div className="flex justify-end">
                    <Button
                        type="primary"
                        size="large"
                        icon={<SendOutlined />}
                        loading={loading}
                        onClick={handleAnalyze}
                        disabled={!text.trim()}
                    >
                        Analyze Text
                    </Button>
                </div>
            </Card>

            {result && (
                <div className="space-y-6 animate-fade-in">
                    {/* Score & General Feedback */}
                    <Card className="shadow-md border-t-4 border-blue-500">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="text-center">
                                <Progress
                                    type="circle"
                                    percent={result.score}
                                    format={(percent) => <span className="text-3xl font-bold">{percent}</span>}
                                    strokeColor={result.score >= 80 ? '#52c41a' : result.score >= 50 ? '#faad14' : '#ff4d4f'}
                                />
                                <div className="mt-2 font-semibold text-gray-600">Overall Score</div>
                            </div>
                            <div className="flex-1">
                                <Title level={4}>Feedback</Title>
                                <Paragraph className="text-lg">{result.feedback}</Paragraph>
                            </div>
                        </div>
                    </Card>

                    {/* Corrections */}
                    {result.corrections.length > 0 && (
                        <Card title={<><WarningOutlined className="text-yellow-500 mr-2" /> Corrections Needed</>} className="shadow-sm">
                            <List
                                itemLayout="horizontal"
                                dataSource={result.corrections}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={
                                                <div className="flex gap-2 items-center flex-wrap">
                                                    <Text delete type="danger" className="text-base">{item.original}</Text>
                                                    <span className="text-gray-400">→</span>
                                                    <Text className="text-green-600 font-bold text-base">{item.corrected}</Text>
                                                </div>
                                            }
                                            description={<Text type="secondary">{item.explanation}</Text>}
                                        />
                                    </List.Item>
                                )}
                            />
                        </Card>
                    )}

                    {/* Better Version */}
                    <Card title={<><CheckCircleOutlined className="text-green-500 mr-2" /> Better Version</>} className="shadow-sm bg-green-50">
                        <Paragraph className="text-lg italic text-gray-700">
                            "{result.betterVersion}"
                        </Paragraph>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ScoringPage;
