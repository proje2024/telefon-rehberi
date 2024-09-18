import React, { useState, useEffect } from 'react';
import { Form, message } from 'antd';
import Axios from '../../Axios';
import { useSubscription } from '../../Context/SubscriptionContext';
import { EditUserModal, AddSubDirectoryModal } from './UserInfoModals';
import CustomTree from './CustomTree';
import './UserInfo.css';
import { useDynamicColumn } from '../../Context/DynamicColumnContext';

const UserInfo = ({ user, onSaveSuccess, tabValue }) => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentDirectoryId, setCurrentDirectoryId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(false); // State to trigger refresh
  const { subscriptions } = useSubscription();
  const { dynamicColumn } = useDynamicColumn(); // Hook to fetch dynamic columns
  const userRole = JSON.parse(localStorage.getItem("user"))?.role;
  const isRoleAdmin = userRole === 1;
  const token = localStorage.getItem('token');

  // Transform user data with dynamic columns
  const transformedData = user ? [{
    ...user,
    ...dynamicColumn.reduce((acc, column) => ({
      ...acc,
      [column.attribute_name.toLowerCase()]: user.dynamicColumns.find(dc => dc.id === column.id)?.value || '',
    }), {})
  }] : [];

  useEffect(() => {
    if (selectedUser) {
      form.setFieldsValue({
        id: selectedUser.id,
        adi: selectedUser.adi,
        internal_number_area_code: selectedUser.internal_number_area_code,
        internal_number: selectedUser.internal_number,
        ip_number_area_code: selectedUser.ip_number_area_code,
        ip_number: selectedUser.ip_number,
        mailbox: selectedUser.mailbox,
        visibility: selectedUser.visibility === 1,
        visibilityForSubDirectory: selectedUser.visibilityForSubDirectory === 1,
        internal_number_subscription_id: selectedUser.internal_number_subscription_id,
        ip_number_subscription_id: selectedUser.ip_number_subscription_id,
        ...dynamicColumn.reduce((acc, column) => ({
          ...acc,
          [`dynamic_column_${column.id}_value`]: selectedUser.dynamicColumns.find(dc => dc.id === column.id)?.value || '',
        }), {})
      });
    }
  }, [selectedUser, form, dynamicColumn]);

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
      visibility: values.visibility ? 1 : 0,
      visibilityForSubDirectory: values.visibilityForSubDirectory ? 1 : 0,
      internal_number_subscription_id: values.internal_number_subscription_id || null,
      ip_number_subscription_id: values.ip_number_subscription_id || null,
      dynamicColumns: dynamicColumn.map(column => ({
        id: column.id,
        value: values[`dynamic_column_${column.id}_value`] || '',
      }))
    };

    try {
      await Axios.post('/api/directory/editNode', userToUpdate, {
        headers: {
          'Authorization': `Bearer ${token}`,  // Token'ı başlıkta gönderin
          'Content-Type': 'application/json',
      }
      });
      message.success('Kullanıcı başarıyla güncellendi');
      form.resetFields();
      setIsEditing(false);
      if (onSaveSuccess) {
        onSaveSuccess();
        setIsModalVisible(false);
      }
    } catch (error) {
      message.error('Kullanıcı güncellenirken hata oluştu');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsEditing(false);
    setIsModalVisible(false);
  };

  const handleAddSubDirectory = async (values) => {
    const requestData = {
      directoryid: currentDirectoryId,
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
      await Axios.post('/api/directory/addSubDirectory', requestData, {
        headers: { 
            'Authorization': `Bearer ${token}`,  // Token'ı başlıkta gönderin
            'Content-Type': 'application/json' },
      });
      message.success('Alt Dizin başarıyla eklendi');
      setIsAddModalVisible(false);
      setRefreshTrigger(prev => !prev); // Toggle refresh trigger
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error) {
      message.error('Alt Dizin eklenirken hata oluştu');
      console.error(error);
    }
  };

  const showAddModal = (id) => {
    setCurrentDirectoryId(id);
    setIsAddModalVisible(true);
  };

  const handleCancelAddModal = () => {
    setIsAddModalVisible(false);
  };

  return (
    <div className="user-info">
      <CustomTree
        data={transformedData}
        onEdit={(record) => {
          setSelectedUser(record);
          setIsModalVisible(true);
        }}
        onAddSubDirectory={showAddModal}
        subscriptions={subscriptions}
        isRoleAdmin={isRoleAdmin}
        onSaveSuccess={onSaveSuccess}
        tabValue={tabValue}
        refreshTrigger={refreshTrigger}
      />
      <EditUserModal
        visible={isModalVisible}
        onCancel={handleCancel}
        onSave={handleSave}
        form={form}
        subscriptions={subscriptions}
        isLoading={isLoading}
        dynamicColumns={dynamicColumn}
      />
      <AddSubDirectoryModal
        visible={isAddModalVisible}
        onCancel={handleCancelAddModal}
        onSave={handleAddSubDirectory}
        subscriptions={subscriptions}
        dynamicColumns={dynamicColumn}
      />
    </div>
  );
};

export default UserInfo;
