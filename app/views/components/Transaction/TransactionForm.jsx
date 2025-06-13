import React from "react";
import {
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Space,
  Row,
  Col,
  Switch,
  Badge,
} from "antd";
import { PlusOutlined, FilterOutlined, SaveOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import styled from "styled-components";

const { Option } = Select;

const FormCard = styled.div`
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03),
    0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02);
  margin-bottom: 16px;
`;

const NoMarginFormItem = styled.div`
  .ant-form-item {
    margin-bottom: 0 !important;
  }
`;

const FullWidthDatePicker = styled(DatePicker)`
  width: 100%;
`;

const FullWidthSelect = styled(Select)`
  width: 100%;
`;

const TransactionForm = ({
  form,
  onSubmit,
  onFilterClick,
  onSaveViewClick,
  hasFiltersApplied,
  hasActiveFilters,
  tags,
}) => {
  return (
    <FormCard>
      <Form
        form={form}
        layout="horizontal"
        onFinish={onSubmit}
        initialValues={{
          transaction_date: dayjs(),
          is_credit: false,
        }}
      >
        <Row gutter={16} align="middle">
          <Col xs={12} sm={3}>
            <NoMarginFormItem>
              <Form.Item
                name="transaction_date"
                rules={[{ required: true, message: "Please select date" }]}
              >
                <FullWidthDatePicker format="DD-MM-YYYY" />
              </Form.Item>
            </NoMarginFormItem>
          </Col>
          <Col xs={24} sm={5}>
            <NoMarginFormItem>
              <Form.Item
                name="name"
                rules={[
                  { required: true, message: "Please enter transaction name" },
                ]}
              >
                <Input placeholder="Transaction name" />
              </Form.Item>
            </NoMarginFormItem>
          </Col>
          <Col xs={12} sm={3}>
            <NoMarginFormItem>
              <Form.Item
                name="amount"
                rules={[{ required: true, message: "Please enter amount" }]}
              >
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  prefix="₹"
                />
              </Form.Item>
            </NoMarginFormItem>
          </Col>
          <Col xs={12} sm={2}>
            <NoMarginFormItem>
              <Form.Item
                name="is_credit"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch checkedChildren="Credit" unCheckedChildren="Credit" />
              </Form.Item>
            </NoMarginFormItem>
          </Col>
          <Col xs={16} sm={7}>
            <NoMarginFormItem>
              <Form.Item name="tag_list">
                <FullWidthSelect mode="tags" placeholder="Add tags...">
                  {tags.map((tag) => (
                    <Option key={tag} value={tag}>
                      {tag}
                    </Option>
                  ))}
                </FullWidthSelect>
              </Form.Item>
            </NoMarginFormItem>
          </Col>
          <Col xs={8} sm={4}>
            <Space>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                Add
              </Button>
              <Badge dot={hasActiveFilters} color="#1890ff">
                <Button icon={<FilterOutlined />} onClick={onFilterClick} />
              </Badge>
              <Button
                id="save-filter"
                icon={<SaveOutlined />}
                onClick={onSaveViewClick}
                disabled={!hasFiltersApplied}
                title={
                  hasFiltersApplied
                    ? "Save current filters as view"
                    : "Apply filters first to save a view"
                }
              />
            </Space>
          </Col>
        </Row>
      </Form>
    </FormCard>
  );
};

export default TransactionForm;
