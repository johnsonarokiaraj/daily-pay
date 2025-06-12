import styled from 'styled-components';
import { Card, Row, DatePicker, Select, Drawer } from 'antd';

// Main container
export const TransactionContainer = styled.div`
  padding: 24px;
`;

// Header styles
export const HeaderContainer = styled.div`
  margin-bottom: 24px;
`;

export const HeaderTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

// Stats styles
export const StatsRow = styled(Row)`
  margin-bottom: 24px;
`;

// Form styles
export const FormCard = styled(Card)`
  margin-bottom: 16px;
`;

export const FormItemNoMargin = styled.div`
  .ant-form-item {
    margin-bottom: 0 !important;
  }
`;

export const FullWidthDatePicker = styled(DatePicker)`
  width: 100%;
`;

export const FullWidthSelect = styled(Select)`
  width: 100%;
`;

// Filter Drawer styles
export const FilterDrawer = styled(Drawer)`
  .ant-drawer-body {
    padding: 24px;
  }
`;

// Table specific styles (extending from the existing file)
export const StyledCard = styled(Card)`
  .ant-table-thead > tr > th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: #fafafa;
  }
  
  .ant-table-body {
    max-height: 600px;
    overflow-y: auto;
  }
`;

// Filter dropdown containers
export const FilterDropdownContainer = styled.div`
  padding: 8px;
  width: 300px;
`;

export const TagFilterDropdownContainer = styled.div`
  padding: 8px;
  width: 360px;
`;

// Common component styles
export const NoMarginFormItem = styled.div`
  .ant-form-item {
    margin: 0 !important;
    margin-bottom: 0 !important;
  }
`;

export const MinWidthSelect = styled(Select)`
  min-width: 120px;
`;

// Statistic value styles
export const StatisticValue = {
  total: { color: "#c85ea2" },
  debit: { color: "#7385d5" },
  credit: { color: "#16a34a" },
  balance: { color: "#f59e0b" }
};
