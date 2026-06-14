import { create } from 'zustand';
import update from 'immutability-helper';
import { addEdge, applyNodeChanges, applyEdgeChanges, Edge } from '@xyflow/react';
import initData from '@/utils/initData';
import { AppNode, AppState } from './type';

// 1. 撤销重做只在拖放结束, 添加节点, 清空节点, 线段连接或者属性配置完成后调用

const useStore = create<AppState>((set, get) => ({
  data: {
    title: 'DJW Design AI Workflow',
    config: null,
    nodes: [],
    edges: [],
  },
  viewport: {
    x: 0,
    y: 0,
    zoom: 1
  },
  onNodesChange: changes => {
    const data = get().data;
    const newData = {
      ...data,
      nodes: applyNodeChanges(changes, data.nodes),
      used: false
    }
    set({
      data: newData,
    });
  },
  onEdgesChange: (changes) => {
    const data = get().data;
    const newData = {
        ...data,
        edges: applyEdgeChanges(changes, data.edges),
        used: false
      }
    set({
      data: newData
    });
  },
  onConnect: (connection) => {
    const data = get().data;
    const newData = {
        ...data,
        edges: addEdge({ ...connection, type: 'fm-edge' }, data.edges),
    }
    set({
        data: newData
    });
  },
  addNode: (node: AppNode) => {
    const data = get().data;
    const newData = {
        ...data,
        nodes: update(data.nodes, { $push: [{
          ...node,
          data: {
            ...node.data,
            // 节点的顺序, 从0开始
            order: data.nodes.length,
          }
        }] }),
    }
    set({ 
        data: newData
    });
  },
  setNodes: (nodes) => {
    const newData = {
      ...get().data,
      nodes,
    }
    set({ 
        data: newData
    });
  },
  updateNode: (node: AppNode) => {
    const data = get().data;
    const newData = {
        ...data,
        nodes: data.nodes.map(v => {
            if (v.id === node.id) {
                return node;
            }
            return v;
        }),
    }
    set({
        data: newData
    });
  },
  updateEdge: (edge: Edge) => {
    const data = get().data;
    const newData = {
        ...data,
        edges: data.edges.map(v => {
            if (v.id === edge.id) {
                return edge;
            }
            return v;
        }),
    }
    set({
        data: newData
    });
  },
  setEdges: (edges) => {
    const newData = {
        ...get().data,
        edges: edges,
    }
    set({ 
        data: newData
     });
  },
  setData: (data) => {
    set({ data });
  },
  clear() {
    set({
      data: initData,
    });
  },
  updateViewport: (viewport) => {
    set({ viewport });
  },
}));

export default useStore
