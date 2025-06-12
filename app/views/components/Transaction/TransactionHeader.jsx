import React from "react";
import { Row, Col, Typography } from "antd";
import styled from "styled-components";

const { Title, Text } = Typography;

const HeaderContainer = styled.div`
  margin-bottom: 24px;
`;

const GradientTitle = styled(Title)`
  margin: 0 !important;
  background: linear-gradient(135deg, #1677ff 0%, #69c0ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const TransactionHeader = () => {
  return (
    <HeaderContainer>
      <Row justify="space-between" align="middle">
        <Col>
          <GradientTitle level={2}>Transaction Dashboard</GradientTitle>
          <Text type="secondary">Manage your daily expenses and income</Text>
        </Col>
        <Col></Col>
      </Row>
    </HeaderContainer>
  );
};

export default TransactionHeader;
