import { memo } from 'react';
import styles from './index.less';

interface IInspectorProps {
  node?: any;
  edge?: any;
}

const params = [
  ['Mode', 'Image Ref'],
  ['Ratio', '16:9'],
  ['Steps', '28'],
  ['Strength', '0.72'],
];

const Inspector = (props: IInspectorProps) => {
  const { node, edge } = props;
  const nodeTitle = node?.data?.style?.text?.content || '';
  const title = edge ? '连接参数' : nodeTitle.split('\n')[0] || '节点参数';
  const subtitle = edge ? 'Flow Link' : nodeTitle.split('\n')[1] || 'AI Node';

  return (
    <aside className={styles.inspector}>
      <div className={styles.header}>
        <span>Node Inspector</span>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>

      <div className={styles.section}>
        <label>
          <span>节点名称</span>
          <input value={title} readOnly />
        </label>
        <label>
          <span>AI 操作</span>
          <select value={edge ? '连接流程' : '图像生成'} disabled>
            <option>图像生成</option>
            <option>文本提示</option>
            <option>局部重绘</option>
            <option>连接流程</option>
          </select>
        </label>
        <label>
          <span>提示词草稿</span>
          <textarea
            readOnly
            value="围绕 DJW Design 的商业视觉风格，组织参考图、提示词、模型生成、人工筛选与输出入库。"
          />
        </label>
      </div>

      <div className={styles.grid}>
        {params.map(([key, value]) => (
          <div className={styles.param} key={key}>
            <span>{key}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className={styles.status}>
        <span />
        Ready for API binding
      </div>
    </aside>
  );
};

export default memo(Inspector);
