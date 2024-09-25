import React, { useState } from 'react';
import { Tree } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import './PhoneTree.css';  // Import CSS

const PhoneTree = ({ data, searchTerm, onNodeSelect }) => {
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [selectedKeys, setSelectedKeys] = useState([]);  // Seçili node'u tutmak için state ekliyoruz

    const filterTree = (nodes, searchTerm) => {
        const normalizedSearchTerm = searchTerm
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');  // Türkçe karakterleri normalize et
    
        return nodes
            .map((node) => {
                const normalizedTitle = node.title
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');  // Türkçe karakterleri normalize et
    
                const matchesSearch = normalizedTitle.includes(normalizedSearchTerm);
    
                if (node.children) {
                    const filteredChildren = filterTree(node.children, normalizedSearchTerm);
                    if (filteredChildren.length > 0 || matchesSearch) {
                        return { ...node, children: filteredChildren };
                    }
                } else if (matchesSearch) {
                    return { ...node };
                }
                return null;
            })
            .filter((node) => node !== null);
    };
    
    const filteredData = searchTerm ? filterTree(data, searchTerm) : data;

    const onSelect = (selectedKeys, info) => {
        onNodeSelect(info.node);
        const key = info.node.key;
        const expanded = expandedKeys.includes(key);
        const newExpandedKeys = expanded
            ? expandedKeys.filter(k => k !== key)
            : [...expandedKeys, key];

        setExpandedKeys(newExpandedKeys);
        setSelectedKeys([key]);  // Sadece son tıklanan node'u seçili yap
    };

    const onExpand = (expandedKeys) => {
        setExpandedKeys(expandedKeys);
    };

    return (
        <div className="custom-tree-container">
            <Tree
                multiple={false}  // Birden fazla node seçimi engellendi
                defaultExpandAll
                treeData={filteredData}
                showIcon
                icon={<UserOutlined style={{ color: 'white' }} />}
                onSelect={onSelect}
                onExpand={onExpand}
                selectedKeys={selectedKeys}  // Seçili olan node'un key'ini belirt
                className="custom-tree"
                blockNode
                style={{backgroundColor: '#395B64'}}
            />
        </div>
    );
};

export default PhoneTree;
