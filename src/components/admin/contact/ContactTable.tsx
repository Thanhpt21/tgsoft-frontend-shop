// components/admin/contact/ContactTable.tsx
'use client';

import React, { useState } from 'react';
import { Table, Spin, Input, Button, Space, message, Popconfirm, Tag, Tooltip, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, DeleteOutlined, SearchOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons'; // Thêm EyeOutlined
import moment from 'moment'; // Để định dạng ngày tháng

// Import các hooks
import { useContacts } from '@/hooks/contact/useContacts';
import { useDeleteContact } from '@/hooks/contact/useDeleteContact';

// Import các modal
import { ContactUpdateModal } from './ContactUpdateModal';

// Import interfaces và enums
import { Contact } from '@/types/contact.type';
import { ContactStatus, ContactType } from '@/enums/contact.enums';


const { Search } = Input;

export default function ContactTable() {
  const [page, setPage] = useState(1);
  const [inputValue, setInputValue] = useState('');
  const [search, setSearch] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // States mới cho modal xem nội dung
  const [openViewCommentModal, setOpenViewCommentModal] = useState(false);
  const [viewCommentContent, setViewCommentContent] = useState('');
  const [viewCommentTitle, setViewCommentTitle] = useState(''); // Thêm title cho modal

  // Kích thước trang mặc định, có thể lấy từ biến môi trường
  const pageSize = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 10;

  const { data, isLoading, refetch } = useContacts({ page, limit: pageSize, search });
  const { mutateAsync: deleteContact, isPending: isDeleting } = useDeleteContact();

  const handleSearch = () => {
    setPage(1); // Reset về trang 1 khi tìm kiếm mới
    setSearch(inputValue);
  };

  const handleTableChange = (pagination: any) => {
    setPage(pagination.current);
    // Nếu bạn muốn thay đổi pageSize qua table, hãy thêm state setLimit và truyền vào useContacts
  };

  const confirmDelete = async (id: number, name: string) => {
    Modal.confirm({
      title: 'Xác nhận xoá liên hệ',
      content: `Bạn có chắc chắn muốn xoá liên hệ của "${name}" không?`,
      okText: 'Xoá',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteContact(id); // Gọi mutation xóa
          // message.success đã được xử lý trong useDeleteContact
          // refetch() cũng tự động gọi bởi invalidateQueries trong useDeleteContact
        } catch (error: any) {
          // Xử lý lỗi đã có trong useDeleteContact
        }
      },
      // Thêm loading state cho nút xác nhận
      okButtonProps: { loading: isDeleting },
    });
  };

  // Hàm mở modal xem nội dung
  const openCommentModal = (content: string, contactName: string) => {
    setViewCommentContent(content);
    setViewCommentTitle(`Nội dung liên hệ từ: ${contactName}`);
    setOpenViewCommentModal(true);
  };

  const columns: ColumnsType<Contact> = [
        {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * 10 + index + 1,
    },
    {
      title: 'Tên người gửi',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Nội dung',
      dataIndex: 'message',
      key: 'message',
      width: 100, // Điều chỉnh độ rộng để vừa với icon
      render: (text: string, record) => ( // Thêm record vào render để lấy tên
        <Space>
          <Tooltip title="Xem chi tiết nội dung">
            <EyeOutlined
              style={{ cursor: 'pointer', color: '#1890ff' }}
              onClick={() => openCommentModal(text, record.name)} // Gọi hàm mở modal
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: ContactStatus) => {
        let color = 'gold'; // Màu mặc định
        switch (status) {
          case ContactStatus.COMPLETED:
            color = 'green';
            break;
          case ContactStatus.FAILED:
            color = 'red';
            break;
          case ContactStatus.PROCESSING:
            color = 'blue';
            break;
          case ContactStatus.PENDING:
          default:
            color = 'orange';
            break;
        }
        return <Tag color={color}>{status}</Tag>;
      },
      filters: Object.values(ContactStatus).map((status) => ({
        text: status,
        value: status,
      })),
      onFilter: (value, record) => record.status === value,
    },
   
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => moment(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              style={{ color: '#1890ff', cursor: 'pointer' }}
              onClick={() => {
                setSelectedContact(record);
                setOpenUpdate(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => confirmDelete(record.id, record.name)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm liên hệ..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            className="w-[300px]"
          />
          <Button type="primary" onClick={handleSearch}>
            <SearchOutlined /> Tìm kiếm
          </Button>
        </div>
       
      </div>

      <Table
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        loading={isLoading || isDeleting} // Hiển thị loading khi đang tải data hoặc đang xóa
        pagination={{
          total: data?.total,
          current: page,
          pageSize: 10,
          onChange: (p) => setPage(p),
          showTotal: (total) => `Tổng ${total} thương hiệu`,
        }}
        scroll={{ x: 'max-content' }} // Cho phép cuộn ngang nếu bảng quá rộng
      />


      {/* Modal Cập nhật Liên hệ */}
      <ContactUpdateModal
        open={openUpdate}
        onClose={() => setOpenUpdate(false)}
        contact={selectedContact} // Truyền dữ liệu contact được chọn xuống modal
        refetch={refetch} // Truyền hàm refetch xuống modal để làm mới bảng sau khi cập nhật
      />

      {/* Modal hiển thị nội dung chi tiết */}
      <Modal
        title={viewCommentTitle}
        visible={openViewCommentModal}
        onCancel={() => setOpenViewCommentModal(false)}
        footer={[
          <Button key="close" onClick={() => setOpenViewCommentModal(false)}>
            Đóng
          </Button>,
        ]}
      >
        <p style={{ whiteSpace: 'pre-wrap' }}>{viewCommentContent}</p> {/* pre-wrap để giữ định dạng xuống dòng */}
      </Modal>
    </div>
  );
}