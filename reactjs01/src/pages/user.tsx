import { notification, Table } from "antd";
import { useEffect, useState } from "react";
import { getUserApi } from "../util/api";

// API trả về mảng user, không phải object

const UserPage = () => {
  const [dataSource, setDataSource] = useState<any[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUserApi();
        if (Array.isArray(res.data)) {
          setDataSource(res.data);
        } else {
          notification.error({
            message: "Lỗi dữ liệu",
            description: "Không lấy được danh sách người dùng.",
          });
        }
      } catch (error) {
        notification.error({
          message: "Lỗi hệ thống",
          description: "Không thể kết nối đến máy chủ.",
        });
      }
    };
    fetchUser();
  }, []);

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Role",
      dataIndex: "role",
    },
  ];

  return (
    <div style={{ padding: 30 }}>
      {/* User Table */}
      <Table
        bordered
        dataSource={dataSource}
        columns={columns}
        rowKey="id"
      />
    </div>
  );
};

export default UserPage;