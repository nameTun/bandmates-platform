import React, { useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, Typography, Button, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useProfileStore } from '../store/useProfileStore';
import { userProfilesService } from '../services/user-profiles.service';
import type { UpdateUserProfileDto } from '../services/user-profiles.service';
import { ExamType, StudyPurpose, WritingFocus } from '@/common/enums/user-profile.enum';

const { Title, Text } = Typography;
const { Option } = Select;

const OnboardingModal: React.FC = () => {
    const { profile, updateProfile } = useProfileStore();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Modal hiển thị khi user đã load xong profile nhưng isOnboardingCompleted là false
    const open = profile !== null && !profile.isOnboardingCompleted;

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const dto: UpdateUserProfileDto = {
                displayName: values.displayName,
                currentBand: values.currentBand ? Number(values.currentBand) : undefined,
                targetBand: values.targetBand ? Number(values.targetBand) : undefined,
                targetDate: values.targetDate ? values.targetDate.toISOString() : undefined,
                examType: values.examType,
                studyPurpose: values.studyPurpose,
                weakestSkill: values.weakestSkill,
            };

            const response = await userProfilesService.completeOnboarding(dto);
            if (response.success) {
                message.success(response.message);
                updateProfile(response.data); // Cập nhật lại Zustand store, modal tự động đóng
            }
        } catch (error) {
            message.error('Có lỗi xảy ra, vui lòng kiểm tra lại kết nối!');
        } finally {
            setLoading(false);
        }
    };

    const generateBandOptions = () => {
        const options = [];
        for (let i = 0; i <= 9; i += 0.5) {
            options.push(<Option key={i} value={i}>{i.toFixed(1)}</Option>);
        }
        return options;
    };

    return (
        <Modal
            open={open}
            closable={false}
            maskClosable={false}
            keyboard={false}
            footer={null}
            width={700}
            centered
            className="onboarding-modal"
            styles={{
                body: { padding: '32px' },
                mask: { backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.4)' }
            }}
        >
            <div className="text-center mb-8 mt-2">
                <Title level={2} className="text-indigo-600 !mb-2" style={{ fontWeight: 800 }}>
                    Chào mừng bạn đến với BandMates! 🎉
                </Title>
                <Text type="secondary" className="text-base text-slate-500">
                    Để AI có thể chấm điểm và tư vấn sát thực tế nhất, vui lòng dành 1 phút chia sẻ mục tiêu học tập của bạn nhé.
                </Text>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                size="large"
                initialValues={{ displayName: profile?.displayName }}
            >
                <Form.Item
                    name="displayName"
                    label={<span className="font-medium text-slate-700">Tên hiển thị của bạn</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập tên của bạn!' }]}
                >
                    <Input prefix={<UserOutlined className="text-gray-400 mr-2" />} placeholder="Ví dụ: John Doe" className="rounded-lg" />
                </Form.Item>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 pt-4 border-t border-slate-100">
                    <Form.Item
                        name="currentBand"
                        label={<span className="font-medium text-slate-700">Band điểm hiện tại</span>}
                        rules={[{ required: true, message: 'Vui lòng chọn band hiện tại!' }]}
                    >
                        <Select placeholder="Bạn đang ở band mấy?" className="custom-select">
                            {generateBandOptions()}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="targetBand"
                        label={<span className="font-medium text-slate-700">Band điểm mục tiêu</span>}
                        rules={[{ required: true, message: 'Vui lòng chọn mục tiêu!' }]}
                    >
                        <Select placeholder="Bạn muốn đạt band mấy?">
                            {generateBandOptions()}
                        </Select>
                    </Form.Item>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <Form.Item
                        name="examType"
                        label={<span className="font-medium text-slate-700">Loại bài thi</span>}
                        rules={[{ required: true, message: 'Vui lòng chọn loại bài thi!' }]}
                    >
                        <Select placeholder="Chọn phân loại">
                            {Object.values(ExamType).map(v => <Option key={v} value={v}>{v}</Option>)}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="targetDate"
                        label={<span className="font-medium text-slate-700">Ngày thi dự kiến</span>}
                        rules={[{ required: true, message: 'Vui lòng chọn ngày thi dự kiến!' }]}
                    >
                        <DatePicker className="w-full rounded-lg" format="DD/MM/YYYY" placeholder="Chọn ngày thi" />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 pt-4 border-t border-slate-100">
                    <Form.Item
                        name="weakestSkill"
                        label={<span className="font-medium text-slate-700">Trọng tâm bạn muốn cải thiện nhất?</span>}
                        rules={[{ required: true, message: 'Vui lòng chọn một mục tiêu!' }]}
                    >
                        <Select placeholder="Chọn vấn đề bạn e ngại nhất">
                            {Object.values(WritingFocus).map(v => <Option key={v} value={v}>{v}</Option>)}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="studyPurpose"
                        label={<span className="font-medium text-slate-700">Mục đích học IELTS</span>}
                        rules={[{ required: true, message: 'Vui lòng chọn mục đích!' }]}
                    >
                        <Select placeholder="Để AI điều chỉnh tone văn bản">
                            {Object.values(StudyPurpose).map(v => <Option key={v} value={v}>{v}</Option>)}
                        </Select>
                    </Form.Item>
                </div>

                <Form.Item className="mt-8 mb-0">
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        block 
                        loading={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 h-14 text-lg font-semibold rounded-xl shadow-lg border-0 transition-all hover:scale-[1.02]"
                    >
                        Bắt đầu lộ trình của tôi 🚀
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default OnboardingModal;
