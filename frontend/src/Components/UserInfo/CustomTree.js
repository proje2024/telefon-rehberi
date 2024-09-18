import React, { useState, useEffect } from 'react';
import { Button, Tooltip, Form, message } from 'antd';
import { EditOutlined, PlusOutlined, DeleteOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import axios from 'axios';
import { EditChildModal } from './UserInfoModals';
import { useDynamicColumn } from '../../Context/DynamicColumnContext';

const CustomTree = ({ data, onEdit, onAddSubDirectory, isRoleAdmin, tabValue, subscriptions, onSaveSuccess, refreshTrigger }) => {
  const [expandedNodes, setExpandedNodes] = useState({});
  const [detailDataMap, setDetailDataMap] = useState({});
  const { dynamicColumn } = useDynamicColumn();
  const [selectedChild, setSelectedChild] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    Object.keys(expandedNodes).forEach(nodeId => {
      if (expandedNodes[nodeId]) {
        fetchDetailData(nodeId, false);
      }
    });
  }, [refreshTrigger]);

  const prepareData = (nodes, dynamicColumns) => {
    return nodes.map(node => {
      const dynamicData = dynamicColumns.reduce((acc, col) => {
        acc[col.attribute_name.toLowerCase()] = node.dynamicColumns.find(dynCol => dynCol.attribute_name === col.attribute_name)?.value || '-';
        return acc;
      }, {});

      return {
        ...node,
        ...dynamicData,
        children: prepareData(node.children, dynamicColumns)
      };
    });
  };

  const dataSource = prepareData(data, dynamicColumn);

  const fetchDetailData = async (nodeId, isChild) => {
    try {
      const response = await axios.get(`/api/directory/getSubDirectory/${nodeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,  // Token'ı başlıkta gönderin
          'Content-Type': 'application/json',
      }
      });

      const updatedData = response.data.map(item => {
        const dynamicData = dynamicColumn.reduce((acc, column) => {
          const value = item.dynamicColumns.find(dc => dc.id === column.id)?.value || '-';
          return { ...acc, [column.attribute_name.toLowerCase()]: value };
        }, {});

        return { ...item, ...dynamicData };
      });

      setDetailDataMap(prev => ({ ...prev, [nodeId]: { data: updatedData, isChild } }));
    } catch (error) {
      console.error("Error fetching detail data:", error);
    }
  };

  const handleToggleExpand = (nodeId) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));

    if (!detailDataMap[nodeId]) {
      fetchDetailData(nodeId, false);
    }
  };

  const handleEditChild = (id) => {
    for (const [key, value] of Object.entries(detailDataMap)) {
      const record = value.data.find(detail => detail.id === id);

      if (record) {
        setSelectedChild(record);
        form.setFieldsValue({
          id: record.id,
          adi: record.adi,
          internal_number_area_code: record.internal_number_area_code,
          internal_number: record.internal_number,
          ip_number_area_code: record.ip_number_area_code,
          ip_number: record.ip_number,
          mailbox: record.mailbox,
          internal_number_subscription_id: record.internal_number_subscription_id,
          ip_number_subscription_id: record.ip_number_subscription_id,
          yenialan: record.yenialan,
          ...record.dynamicColumns.reduce((acc, col) => ({
            ...acc,
            [`dynamic_column_${col.id}_value`]: col.value
          }), {})
        });
        setIsModalVisible(true);
        return;
      }
    }

    console.error('Record not found for ID:', id);
  };

  const handleDeleteChild = async (id, parentId) => {
    try {
      await axios.delete(`/api/directory/deleteSubDirectory/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`,  // Token'ı başlıkta gönderin
            'Content-Type': 'application/json',
        }
    });
      message.success('Alt Dizin başarıyla silindi');
        
      if (parentId) {
        fetchDetailData(parentId, true);
      }
    } catch (error) {
      message.error('Alt Dizin silinirken hata oluştu');
    }
  };

  const getColumns = (isChild) => {
    const baseColumns = [
      { title: process.env.REACT_APP_NAME_LABEL || 'Adı', dataIndex: 'adi', key: 'adi', align: 'center' },
      { title: `${process.env.REACT_APP_INTERNAL_NUMBER_LABEL || 'Sabit Numara'} Alan Kodu`, dataIndex: 'internal_number_area_code', key: 'internal_number_area_code', align: 'center' },
      { title: process.env.REACT_APP_INTERNAL_NUMBER_LABEL || 'Sabit Numara', dataIndex: 'internal_number', key: 'internal_number', align: 'center' },
      {
        title: `${process.env.REACT_APP_INTERNAL_NUMBER_LABEL || 'Sabit Numara'} Abonelik Türü`,
        dataIndex: 'internal_number_subscription_id',
        key: 'internal_number_subscription_id',
        align: 'center',
        render: id => {
          const subscription = subscriptions.find(opt => opt.value === id);
          return subscription ? subscription.label : ' ';
        },
      },
      { title: `${process.env.REACT_APP_IP_NUMBER_LABEL || 'IP Numara'} Alan Kodu`, dataIndex: 'ip_number_area_code', key: 'ip_number_area_code', align: 'center' },
      { title: process.env.REACT_APP_IP_NUMBER_LABEL || 'IP Numara', dataIndex: 'ip_number', key: 'ip_number', align: 'center' },
      {
        title: `${process.env.REACT_APP_IP_NUMBER_LABEL || 'IP Numara'} Abonelik Türü`,
        dataIndex: 'ip_number_subscription_id',
        key: 'ip_number_subscription_id',
        align: 'center',
        render: id => {
          const subscription = subscriptions.find(opt => opt.value === id);
          return subscription ? subscription.label : ' ';
        },
      },
      { title: process.env.REACT_APP_MAILBOX_LABEL || 'Posta Kutusu', dataIndex: 'mailbox', key: 'mailbox', align: 'center' },
    ];

    let columns = baseColumns;

    if (!isRoleAdmin) {
      const tabColumns = {
        0: ['adi', 'internal_number_area_code', 'internal_number', 'internal_number_subscription_id'],
        1: ['adi', 'ip_number_area_code', 'ip_number', 'ip_number_subscription_id'],
        2: ['adi', 'mailbox'],
      };

      columns = baseColumns.filter(col => tabColumns[tabValue]?.includes(col.key));
    }

    if (isRoleAdmin) {
      if (!isChild) {
        columns.push(
          { title: 'Görünürlük', dataIndex: 'visibility', key: 'visibility', align: 'center', render: visibility => (visibility ? 'Görünür' : 'Gizli') },
          { title: 'Alt Dizinler Görüntülensin Mi?', dataIndex: 'visibilityForSubDirectory', key: 'visibilityForSubDirectory', align: 'center', render: visibility => (visibility ? 'Evet' : 'Hayır') }
        );
      }

      dynamicColumn.forEach(col => {
        columns.push({ title: col.attribute_name, dataIndex: col.attribute_name.toLowerCase(), key: col.attribute_name.toLowerCase(), align: 'center' });
      });

      if (!isChild) {
        columns.push({
          title: 'İşlemler',
          key: 'actions',
          align: 'center',
          render: (_, record) => (
            <span>
              {(
                <>
                  <Tooltip title="Güncelle">
                    <Button icon={<EditOutlined />} onClick={() => onEdit(record)} type="primary" />
                  </Tooltip>
                  <Tooltip title="Yeni Alt Birim Ekle">
                    <Button icon={<PlusOutlined />} onClick={() => onAddSubDirectory(record.id)} type="primary" />
                  </Tooltip>
                </>
              )}
            </span>
          ),
        });
      }
    }

    return columns;
  };

  const columns = getColumns(false);

  const getColumnStyle = (col) => ({
    flex: col.flex || 1,
    textAlign: col.align || 'left',
    padding: '8px',
    color: '#fff',
    backgroundColor: '#2f4b52',
  });

  const renderTreeNodes = (nodes) => {
    return nodes.map(node => {
      const renderNodeColumns = () => {
        return columns.map((col) => (
          <div key={col.key} style={getColumnStyle(col)}>
            {col.render ? col.render(node[col.dataIndex], node) : node[col.dataIndex]}
          </div>
        ));
      };
      
      return (
        <div key={node.id}>
          <div style={{ cursor: 'pointer', padding: '5px 0', display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1, padding: '5px 0' }}>
              <div style={{ display: 'flex', width: '100%' }}>
                {(
                  <div style={{ marginRight: '10px', cursor: 'pointer' , padding: '8px'}} onClick={() => handleToggleExpand(node.id)}>
                    {expandedNodes[node.id] ? <DownOutlined /> : <RightOutlined />}
                  </div>
                )}
                {renderNodeColumns()}
              </div>
            </div>
          </div>
          {expandedNodes[node.id] && detailDataMap[node.id] && (
            <div style={{ paddingLeft: '25px', marginTop: '10px' }}>
              {detailDataMap[node.id].data.map(detail => (
                <div key={detail.id} style={{ display: 'flex', marginBottom: '5px' }}>
                  {getColumns(true).map(col => (
                    <div key={col.key} style={getColumnStyle(col)}>
                      {col.render ? col.render(detail[col.dataIndex]) : detail[col.dataIndex] || '-'}
                    </div>
                  ))}
                  {isRoleAdmin && (
                    <div style={{ flex: 1,textAlign: 'left',padding: '8px',color: '#fff',backgroundColor: '#2f4b52', }}> 
                      <Tooltip title="Alt Dizin Düzenle">
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          onClick={() => handleEditChild(detail.id)}
                          style={{ marginRight: 8 , marginLeft: 8,}}
                        />
                      </Tooltip>
                      <Tooltip title="Alt Dizin Sil">
                        <Button
                          type="primary"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteChild(detail.id, node.id)}
                        />
                      </Tooltip>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {node.children && expandedNodes[node.id] && (
            <div style={{ paddingLeft: '20px', marginTop: '10px' }}>
              {renderTreeNodes(node.children)}
            </div>
          )}
        </div>
      );
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const handleSave = async (values) => {
    setIsLoading(true);
    const userToUpdate = {
      id: String(values.id),
      adi: values.adi,
      internal_number_area_code: values.internal_number_area_code,
      internal_number: values.internal_number,
      ip_number_area_code: values.ip_number_area_code,
      ip_number: values.ip_number,
      mailbox: values.mailbox,
      internal_number_subscription_id: values.internal_number_subscription_id || null,
      ip_number_subscription_id: values.ip_number_subscription_id || null,
      dynamicColumns: dynamicColumn.map(column => ({
        id: column.id,
        value: values[`dynamic_column_${column.id}_value`] || '',
      }))
    };

    try {
      await axios.post('/api/directory/editSubNode', userToUpdate, {
        headers: {
          'Authorization': `Bearer ${token}`,  // Token'ı başlıkta gönderin
          'Content-Type': 'application/json',
          }
      });
      message.success('Alt birim başarıyla güncellendi');
      form.resetFields();
      setIsModalVisible(false);

      await Promise.all(Object.keys(expandedNodes).map(id => fetchDetailData(id, true)));

      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error) {
      message.error('Alt birim güncellenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${getColumns(false).length}, 1fr)`, backgroundColor: '#2f4b52', padding: '8px', borderRadius: '4px', color: '#fff' }}>
        {columns.map(col => (
          <div key={col.key} style={getColumnStyle(col)}>
            {col.title}
          </div>
        ))}
      </div>
      {renderTreeNodes(dataSource)}
      <EditChildModal
        visible={isModalVisible}
        onCancel={handleCancel}
        onSave={handleSave}
        form={form}
        subscriptions={subscriptions}
        dynamicColumns={dynamicColumn}
      />
    </div>
  );
};

export default CustomTree;
