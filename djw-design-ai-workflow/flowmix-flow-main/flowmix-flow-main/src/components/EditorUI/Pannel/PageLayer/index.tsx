import { useState, useMemo, type CSSProperties } from 'react';
import { Segmented, Button, Empty, Tag } from "antd";
import { Link, useSearchParams } from 'umi';
import { DeleteOutlined } from '@ant-design/icons'
import classnames from 'classnames';
import styles from './index.less';

export interface IPageLayerProps {
    visible: boolean;
    list?: {
        id: string;
        title: string;
    }[];
    nodes?: any[];
    onNodeClick?: (node: any) => void;
    onAddNode?: (template: { label: string; desc: string; tone: string }) => void;
    onNewPage?: () => void;
    onDelPage?: (id: string) => void;
}

const aiNodeTemplates = [
    { label: '文本输入', desc: 'Prompt / Brief', tone: '#f2a43a' },
    { label: '参考图片', desc: 'Image Reference', tone: '#34d399' },
    { label: '图像生成', desc: 'Text to Image', tone: '#60a5fa' },
    { label: '视频生成', desc: 'Image to Video', tone: '#f97316' },
    { label: '局部重绘', desc: 'Inpaint / Extend', tone: '#a78bfa' },
    { label: '结果输出', desc: 'Export / Archive', tone: '#f8fafc' },
];

const PageLayer = (props: IPageLayerProps) => {
    const { 
        visible, 
        list, 
        nodes,
        onNodeClick = () => {}, 
        onAddNode = () => {},
        onNewPage = () => {}, 
        onDelPage 
    } = props;
    const [curType, setCurType] = useState('library');
    const [searchParams] = useSearchParams();
    const orderNodes = useMemo(() => {
        return nodes? nodes.sort((a, b) => {
            return a.data.order - b.data.order;
        }) : [];
    }, [nodes])
    return <div className={styles.pageLayer} style={{display: visible ? 'block' : 'none'}}>
                <div className={styles.bars}>
                    <Segmented<string>
                        options={[
                            {
                                value: 'page',
                                label: '工作流'
                            },
                            {
                                value: 'library',
                                label: '节点库'
                            },
                            {
                                value: 'layer',
                                label: '节点'
                            }
                        ]}
                        defaultValue={curType}
                        onChange={(value) => {
                            setCurType(value);
                        }}
                    />
                </div>
                <div className={styles.content}>
                    {
                        curType === 'page' && 
                        <div className={styles.page}>
                            <div className={styles.list}>
                                {
                                    list && list.length ? list.map((item) => {
                                        return <div className={classnames(styles.item, searchParams.get("id") === item.id && styles.selected)} key={item.id}>
                                           <Link to={`?id=${item.id}`}>{item.title}</Link> 
                                           <span className={styles.delBtn} onClick={() => {
                                               onDelPage && onDelPage(item.id);
                                           }}><DeleteOutlined /></span>
                                        </div>
                                    }) : <Empty description="暂无流程" style={{paddingTop: 20}} />
                                }
                            </div>
                            <div style={{textAlign: 'center', marginTop: 16}}><Button onClick={onNewPage} type="primary">+ 新建流程</Button></div>
                        </div>
                    }

                    {
                        curType === 'library' && 
                        <div className={styles.library}>
                            <div className={styles.list}>
                                {
                                    aiNodeTemplates.map((item) => {
                                        return <button 
                                            className={styles.nodePreset} 
                                            type="button"
                                            key={item.label}
                                            onClick={() => onAddNode(item)}
                                            style={{'--tone': item.tone} as CSSProperties}
                                        >
                                            <span>{item.label}</span>
                                            <small>{item.desc}</small>
                                        </button>
                                    })
                                }
                            </div>
                        </div>
                    }

                    {
                        curType === 'layer' && 
                        <div className={styles.layer}>
                            <div className={styles.list}>
                                {
                                    orderNodes.length ? orderNodes.map((item, i) => {
                                        const value = item.type === 'Image' ? (item.data.style?.file?.url || 'https://magic.dooring.vip/assets/logo-nvGOfOJy.png') : item.data.style?.text?.content;
                                        return <div className={classnames(styles.pd, item.selected && styles.selected)} key={i} onClick={() => onNodeClick(item)}>
                                                    <Tag>{ item.data.order || 0 }</Tag>
                                                    {
                                                        item.type === 'Image' ? <img src={value} alt="" /> : <div className={styles.text}>{value}</div>
                                                    }

                                                    <span className={styles.tag}><Tag color="blue">{ item.type }</Tag></span>
                                                    
                                                </div>
                                    }) : <Empty description="暂无节点" style={{paddingTop: 20}} />
                                }
                                
                            </div>
                        </div>
                    }
                    
                </div>
                
    </div>
}

export default PageLayer;
