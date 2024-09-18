import React from 'react';
import { Modal, Form, Input, Button, Checkbox, Select } from 'antd';

const { Option } = Select;

export const EditUserModal = ({ visible, onCancel, onSave, form, subscriptions, dynamicColumns }) => (
  <Modal
    title="Kullanıcı Bilgilerini Güncelle"
    visible={visible}
    onCancel={onCancel}
    footer={null}
    className="dark-modal"
  >
    <Form
      form={form}
      onFinish={onSave}
      layout="vertical"
    >
      <Form.Item name="id" noStyle>
        <Input type="hidden" />
      </Form.Item>
      <Form.Item
        name="adi"
        label={process.env.REACT_APP_NAME_LABEL}
        rules={[{ required: true, message: process.env.REACT_APP_NAME_LABEL +' alanı doldurulması zorunludur!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="internal_number_area_code"
        label={`${process.env.REACT_APP_INTERNAL_NUMBER_LABEL} Alan Kodu`}
        rules={[{ required: true, message: process.env.REACT_APP_INTERNAL_NUMBER_LABEL + ' Alan Kodu alanı doldurulması zorunludur!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="internal_number"
        label={process.env.REACT_APP_INTERNAL_NUMBER_LABEL}
        rules={[{ required: true, message: process.env.REACT_APP_INTERNAL_NUMBER_LABEL + ' alanı doldurulması zorunludur!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="internal_number_subscription_id"
        label={`${process.env.REACT_APP_INTERNAL_NUMBER_LABEL} Abonelik Türü`}
        rules={[{ required: true, message: 'Abonelik türü seçilmeli!' }]}
      >
        <Select>
          {subscriptions.map(sub => (
            <Option key={sub.value} value={sub.value}>
              {sub.label}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="ip_number_area_code"
        label={`${process.env.REACT_APP_IP_NUMBER_LABEL} Alan Kodu`}
        rules={[{ required: true, message: process.env.REACT_APP_IP_NUMBER_LABEL + ' Alan Kodu alanı doldurulması zorunludur!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="ip_number"
        label={process.env.REACT_APP_IP_NUMBER_LABEL}
        rules={[{ required: true, message: process.env.REACT_APP_IP_NUMBER_LABEL + ' alanı doldurulması zorunludur!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="ip_number_subscription_id"
        label={`${process.env.REACT_APP_IP_NUMBER_LABEL} Abonelik Türü`}
        rules={[{ required: true, message: 'Abonelik türü seçilmeli!' }]}
      >
        <Select>
          {subscriptions.map(sub => (
            <Option key={sub.value} value={sub.value}>
              {sub.label}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="mailbox"
        label={process.env.REACT_APP_MAILBOX_LABEL}
        rules={[
          { required: true, message: 'Email adresi gerekli!' },
          { type: 'email', message: 'Geçersiz Email!' }
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item name="visibility" valuePropName="checked">
        <Checkbox>{process.env.REACT_APP_VISIBILITY_LABEL}</Checkbox>
      </Form.Item>
      <Form.Item name="visibilityForSubDirectory" valuePropName="checked">
        <Checkbox>Alt Dizinler Görüntülensin Mi?</Checkbox>
      </Form.Item>
      
      {/* Dinamik kolonlar için form alanları */}
      {dynamicColumns.map((column) => (
        <React.Fragment key={column.id}>
          <Form.Item
            name={`dynamic_column_${column.id}_id`} // ID'yi saklamak için benzersiz name
            initialValue={column.id} // Kolonun ID'si bu inputta gizli olarak saklanır
            style={{ display: 'none' }} // Gizli input
          >
            <Input type="hidden" />
          </Form.Item>
          <Form.Item
            name={`dynamic_column_${column.id}_value`} // Value için benzersiz name
            label={column.attribute_name} // Kolonun etiketi
            rules={[{ required: true, message: `${column.attribute_name} alanı doldruulması zorunludur!` }]} // Validation kuralı
          >
            <Input />
          </Form.Item>
        </React.Fragment>
      ))}

      <Form.Item>
        <Button type="primary" htmlType="submit" className="submit-button">
          Kaydet
        </Button>
        <Button className="cancel-button" style={{ marginLeft: '10px' }} onClick={onCancel}>
          İptal
        </Button>
      </Form.Item>
    </Form>
  </Modal>
);
export const AddSubDirectoryModal = ({ visible, onCancel, onSave, subscriptions, dynamicColumns}) => (
  <Modal
    title="Alt Dizin Ekle"
    visible={visible}
    onCancel={onCancel}
    footer={null}
    className="dark-modal"
  >
    <Form
      onFinish={onSave}
      layout="vertical"
    >
      <Form.Item name="directoryId" noStyle>
        <Input type="hidden" />
      </Form.Item>
      <Form.Item
        name="adi"
        label={process.env.REACT_APP_NAME_LABEL}
        rules={[{ required: true, message: process.env.REACT_APP_NAME_LABEL +' alanı doldurulması zorunludur!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="internal_number_area_code"
        label={`${process.env.REACT_APP_INTERNAL_NUMBER_LABEL} Alan Kodu`}
        rules={[{ required: true, message: process.env.REACT_APP_INTERNAL_NUMBER_LABEL + ' Alan Kodu alanı doldurulması zorunludur!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="internal_number"
        label={process.env.REACT_APP_INTERNAL_NUMBER_LABEL}
        rules={[{ required: true, message: process.env.REACT_APP_INTERNAL_NUMBER_LABEL + ' alanı doldurulması zorunludur!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="internal_number_subscription_id"
        label={`${process.env.REACT_APP_INTERNAL_NUMBER_LABEL} Abonelik Türü`}
        rules={[{ required: true, message: 'Abonelik türü seçilmeli!' }]}
      >
        <Select>
          {subscriptions.map(sub => (
            <Option key={sub.value} value={sub.value}>
              {sub.label}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="ip_number_area_code"
        label={`${process.env.REACT_APP_IP_NUMBER_LABEL} Alan Kodu`}
        rules={[{ required: true, message: process.env.REACT_APP_IP_NUMBER_LABEL + ' Alan Kodu alanı doldurulması zorunludur!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="ip_number"
        label={process.env.REACT_APP_IP_NUMBER_LABEL}
        rules={[{ required: true, message: process.env.REACT_APP_IP_NUMBER_LABEL + ' alanı doldurulması zorunludur!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="ip_number_subscription_id"
        label={`${process.env.REACT_APP_IP_NUMBER_LABEL} Abonelik Türü`}
        rules={[{ required: true, message: 'Abonelik türü seçilmeli!' }]}
      >
        <Select>
          {subscriptions.map(sub => (
            <Option key={sub.value} value={sub.value}>
              {sub.label}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="mailbox"
        label={process.env.REACT_APP_MAILBOX_LABEL}
        rules={[
          { required: true, message: 'Email adresi gerekli!' },
          { type: 'email', message: 'Geçersiz Email!' }
        ]}
      >
        <Input />
      </Form.Item>


      {/* Dinamik kolonlar için form alanları */}
      {dynamicColumns.map((column) => (
      <React.Fragment key={column.id}>
        <Form.Item
          name={`dynamic_column_${column.id}_id`} // ID'yi saklamak için benzersiz name
          initialValue={column.id} // Kolonun ID'si bu inputta gizli olarak saklanır
          style={{ display: 'none' }} // Gizli input
        >
          <Input type="hidden" />
        </Form.Item>
        <Form.Item
          name={`dynamic_column_${column.id}_value`} // Value için benzersiz name
          label={column.attribute_name} // Kolonun etiketi
          rules={[{ required: true, message: `${column.attribute_name} alanı doldruulması zorunludur!` }]} // Validation kuralı
        >
          <Input />
        </Form.Item>
      </React.Fragment>

      ))}
      <Form.Item>
        <Button type="primary" htmlType="submit" className="submit-button">
          Kaydet
        </Button>
        <Button className="cancel-button" style={{ marginLeft: '10px' }} onClick={onCancel}>
          İptal
        </Button>
      </Form.Item>
    </Form>
  </Modal>
);

export const EditChildModal = ({ visible, onCancel, onSave, form, subscriptions, dynamicColumns }) => (
  <Modal
    title="Alt Birim Bilgilerini Güncelle"
    visible={visible}
    onCancel={onCancel}
    footer={null}
    className="dark-modal"
  >
    <Form
      form={form}
      onFinish={onSave}
      layout="vertical"
    >
      <Form.Item name="id" noStyle>
        <Input type="hidden" />
      </Form.Item>
      <Form.Item
        name="adi"
        label={process.env.REACT_APP_NAME_LABEL}
        rules={[{ required: true, message: process.env.REACT_APP_NAME_LABEL +' alanı doldurulması zorunludur!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="internal_number_area_code"
        label={`${process.env.REACT_APP_INTERNAL_NUMBER_LABEL} Alan Kodu`}
        rules={[{ required: true, message: process.env.REACT_APP_INTERNAL_NUMBER_LABEL + ' Alan Kodu alanı doldurulması zorunludur!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="internal_number"
        label={process.env.REACT_APP_INTERNAL_NUMBER_LABEL}
        rules={[{ required: true, message: process.env.REACT_APP_INTERNAL_NUMBER_LABEL + ' alanı doldurulması zorunludur!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="internal_number_subscription_id"
        label={`${process.env.REACT_APP_INTERNAL_NUMBER_LABEL} Abonelik Türü`}
        rules={[{ required: true, message: 'Abonelik türü seçilmeli!' }]}
      >
        <Select>
          {subscriptions.map(sub => (
            <Option key={sub.value} value={sub.value}>
              {sub.label}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="ip_number_area_code"
        label={`${process.env.REACT_APP_IP_NUMBER_LABEL} Alan Kodu`}
        rules={[{ required: true, message: process.env.REACT_APP_IP_NUMBER_LABEL + ' Alan Kodu alanı doldurulması zorunludur!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="ip_number"
        label={process.env.REACT_APP_IP_NUMBER_LABEL}
        rules={[{ required: true, message: process.env.REACT_APP_IP_NUMBER_LABEL + ' alanı doldurulması zorunludur!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="ip_number_subscription_id"
        label={`${process.env.REACT_APP_IP_NUMBER_LABEL} Abonelik Türü`}
        rules={[{ required: true, message: 'Abonelik türü seçilmeli!' }]}
      >
        <Select>
          {subscriptions.map(sub => (
            <Option key={sub.value} value={sub.value}>
              {sub.label}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="mailbox"
        label={process.env.REACT_APP_MAILBOX_LABEL}
        rules={[
          { required: true, message: 'Email adresi gerekli!' },
          { type: 'email', message: 'Geçersiz Email!' }
        ]}
      >
        <Input />
      </Form.Item>

      {/* Dinamik kolonlar için form alanları */}
      {dynamicColumns.map((column) => (
        <React.Fragment key={column.id}>
          <Form.Item
            name={`dynamic_column_${column.id}_id`} // ID'yi saklamak için benzersiz name
            initialValue={column.id} // Kolonun ID'si bu inputta gizli olarak saklanır
            style={{ display: 'none' }} // Gizli input
          >
            <Input type="hidden" />
          </Form.Item>
          <Form.Item
            name={`dynamic_column_${column.id}_value`} // Value için benzersiz name
            label={column.attribute_name} // Kolonun etiketi
            rules={[{ required: true, message: `${column.attribute_name} alanı doldruulması zorunludur!` }]} // Validation kuralı
          >
            <Input />
          </Form.Item>
        </React.Fragment>
      ))}

      <Form.Item>
        <Button type="primary" htmlType="submit" className="submit-button">
          Kaydet
        </Button>
        <Button className="cancel-button" style={{ marginLeft: '10px' }} onClick={onCancel}>
          İptal
        </Button>
      </Form.Item>
    </Form>
  </Modal>
);