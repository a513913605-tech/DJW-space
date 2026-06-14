import Header from "@/components/Header";
import { 
    CaretRightOutlined, 
    AppstoreOutlined, 
    ExclamationCircleOutlined,
    UploadOutlined,
    GithubOutlined
} from "@ant-design/icons";
import { Button, Typography, Tooltip, Tour } from "antd";
import type { TourProps } from 'antd';
import { useRef, useState } from "react";
import { DeviconProlog, VscodeIconsFileTypeWord } from '../../Icon';

import styles from './index.less';

const { Paragraph } = Typography;

interface IHeaderProps {
    logoText?: string;
    title?: string;
    onTitleChange?: (value: string) => void;
    onPublishClick?: () => void;
    onPreviewClick?: () => void;
    onLayerClick?: () => void;
    onImportClick?: () => void;
    onTplClick?: () => void;
}

const EditHeader = (props: IHeaderProps) => {
    const { 
        title = '未命名', 
        logoText = 'DJW Design AI',
        onTitleChange, 
        onPublishClick, 
        onLayerClick, 
        onPreviewClick,
        onImportClick, 
    } = props;
    const ref1 = useRef(null);
    const ref3 = useRef(null);
    const ref5 = useRef(null);
    const ref6 = useRef(null);
    const [open, setOpen] = useState(() => {
        const hadGuide = localStorage.getItem('showGuide') === 'true';
        return !hadGuide;
    })
    const steps:TourProps['steps'] = [
        {
            target: () => ref1.current,
            title: '工作流列表',
            description: '在这里管理不同的 AI 创作流程草稿。',
            nextButtonProps: {
                children: '下一步',
            }
        },
        {
            target: () => ref3.current,
            title: '导入流程',
            description: '导入 JSON 后可以继续编辑已有的工作流。',
            nextButtonProps: {
                children: '下一步',
            },
            prevButtonProps: {
                children: '上一步',
            }
        },
        {
            target: () => ref5.current,
            title: '预览画板',
            description: '隐藏编辑面板，检查整条 AI 流程的展示效果。',
            nextButtonProps: {
                children: '下一步',
            },
            prevButtonProps: {
                children: '上一步',
            }
        },
        {
            target: () => ref6.current,
            title: '导出流程',
            description: '把当前 AI 工作流导出为 JSON，方便备份和后续接入。',
            nextButtonProps: {
                children: '完成',
            },
            prevButtonProps: {
                children: '上一步',
            }
        },
    ];
    const finishGuide = () => {
        setOpen(false);
        localStorage.setItem('showGuide', 'true');
    }
    const handleTitleChange = (value: string) => {
        if(value.length > 20) {
            value = value.slice(0, 20);
        }
        onTitleChange && onTitleChange(value);
    }
    return <Header text={logoText}>
        <div className={styles.leftControl}>
            <Button 
                type="primary"
                className={styles.btn}
                onClick={onLayerClick}
                icon={<AppstoreOutlined />} 
                size="small"
                ref={ref1}
            />
            <Button 
                type="primary" 
                className={styles.btn} 
                icon={<UploadOutlined />} 
                size="small" 
                onClick={onImportClick}
                ref={ref3}
            />

            <Button 
                type="primary" 
                className={styles.btn} 
                icon={<CaretRightOutlined />} 
                size="small" 
                onClick={onPreviewClick}
                ref={ref5}
            />
            <Button 
                type="primary" 
                className={styles.btn} 
                size="small"
                onClick={onPublishClick}
                ref={ref6}
            >
                导出
            </Button>
            
        </div>
        <div className={styles.title}>
            <span>
                <Tooltip title="单击标题可编辑"><ExclamationCircleOutlined /> 流程名称: </Tooltip>
            </span>
            <Paragraph
                editable={{
                tooltip: null,
                onChange: handleTitleChange,
                // @ts-ignore
                triggerType: "text",
                }}
            >
                { title }
            </Paragraph>
        </div>
        <div className={styles.rightControl}>
            <Button 
                    type="link" 
                    className={styles.btn} 
                    size="small"
                    icon={<DeviconProlog />}
                    onClick={() => window.open('/flow')}
                >
                Run Mock
            </Button>
            <Button 
                    type="link" 
                    className={styles.btn} 
                    size="small"
                    icon={<VscodeIconsFileTypeWord />}
                    onClick={() => window.open('/docx')}
                >
                Asset Library
            </Button>
            <Button 
                    type="link" 
                    className={styles.btn} 
                    size="small"
                    icon={<GithubOutlined />}
                    onClick={() => window.open('https://github.com/MrXujiang/flowmix-flow')}
                >
                Source
            </Button>
        </div>
        <Tour 
            open={open} 
            onClose={finishGuide} 
            mask={true} 
            type="primary" 
            steps={steps} 
            onFinish={finishGuide}
        />
        
    </Header>;
}

export default EditHeader;
