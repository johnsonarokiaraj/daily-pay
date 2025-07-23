import React from "react";
import { Card, Statistic, Row, Col, Typography } from "antd";
import styled from "styled-components";
import { CalendarOutlined } from "@ant-design/icons";
const StatsRow = styled(Row)`
  margin-bottom: 24px;
`;

const CustomLabel = styled.div`
  margin-bottom: 4px;
  color: rgba(0, 0, 0, 0.45);
`;

const PeriodText = styled.div`
  margin-bottom: 4px;
  color: #f59e0b;
`;

const StatisticValue = {
  total: { color: "#c85ea2" },
  debit: { color: "#7385d5" },
  credit: { color: "#16a34a" },
  balance: { color: "#f59e0b" },
  period: { color: "#f59e0b" },
};
const { Text } = Typography;
const TransactionStats = ({ stats, currentDateRange, pagination }) => {
  const balance = (stats.credit || 0) - (stats.debit || 0);
  return (
    <StatsRow gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Total Transactions"
            value={pagination.total_count || 0}
            prefix="#"
            valueStyle={StatisticValue.total}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Total Debit"
            value={stats.debit}
            precision={2}
            prefix="₹"
            valueStyle={StatisticValue.debit}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Total Credit"
            value={stats.credit}
            prefix="₹"
            valueStyle={StatisticValue.credit}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Balance"
            value={balance}
            precision={2}
            prefix="₹"
            valueStyle={StatisticValue.balance}
          />
        </Card>
      </Col>
      <Col xs={24} sm={24} md={24}>
        <Text
          type="secondary"
          style={{ textAlign: "right", display: "block", marginRight: 15 }}
        >
          <CustomLabel style={{ display: "inline", marginRight: 8 }}>
            <CalendarOutlined style={{ marginRight: 8 }} />
            Current Period:
          </CustomLabel>
          <PeriodText style={{ display: "inline" }}>
            {currentDateRange.startDate.format("DD-MM-YYYY") +
              " - " +
              currentDateRange.endDate.format("DD-MM-YYYY")}
          </PeriodText>
        </Text>
      </Col>
    </StatsRow>
  );
};

export default TransactionStats;
