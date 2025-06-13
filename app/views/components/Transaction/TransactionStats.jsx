import React from "react";
import { Card, Statistic, Row, Col } from "antd";
import styled from "styled-components";
import { CalendarOutlined } from "@ant-design/icons";
const StatsRow = styled(Row)`
  margin-bottom: 24px;
`;

const CustomLabel = styled.div`
  margin-bottom: 4px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
`;

const PeriodText = styled.div`
  margin-bottom: 4px;
  color: #f59e0b;
  font-size: 19px;
`;

const StatisticValue = {
  total: { color: "#c85ea2" },
  debit: { color: "#7385d5" },
  credit: { color: "#16a34a" },
  period: { color: "#f59e0b" },
};

const TransactionStats = ({ stats, currentDateRange }) => {
  return (
    <StatsRow gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Total Transactions"
            value={stats.count}
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
          <CustomLabel>Current Period</CustomLabel>
          <PeriodText>
            <CalendarOutlined style={{ marginRight: 8 }} />
            {currentDateRange.startDate.format("DD-MM-YYYY") +
              " - " +
              currentDateRange.endDate.format("DD-MM-YYYY")}
          </PeriodText>
        </Card>
      </Col>
    </StatsRow>
  );
};

export default TransactionStats;
