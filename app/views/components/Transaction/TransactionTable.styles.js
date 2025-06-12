import styled from 'styled-components';
import { Card, Space, Button, Input, Select } from 'antd';

// Main container card
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

// Filter button containers
export const FilterButtonSpace = styled(Space)`
  margin: 5px 0px 10px;
`;

// Form input containers
export const FormInputContainer = styled.div`
  margin: 0;
`;

export const AmountInputSpace = styled(Space)`
  width: 100%;
`;

// Filter buttons
export const FilterButton = styled(Button)`
  width: 90px;
`;

export const FilterButtonSmall = styled(Button)`
  width: 60px;
`;

// Search input
export const SearchInput = styled(Input)`
  margin-bottom: 8px;
`;

// Tag select
export const TagSelect = styled(Select)`
  width: 100%;
  margin-bottom: 8px;
`;

// Tag in dropdown
export const DropdownTag = styled.div`
  margin: 0;
`;

// Amount text styling
export const AmountText = styled.span`
  font-weight: bold;
  color: ${props => props.isCredit ? 'rgb(16, 185, 129)' : 'rgb(115, 133, 213)'};
`;

// Filter icon with conditional color
export const FilterIcon = styled.span`
  color: ${props => props.filtered ? '#1677ff' : 'inherit'};
`;

// Form item wrapper to remove default margins
export const FormItemWrapper = styled.div`
  .ant-form-item {
    margin: 0 !important;
    margin-bottom: 0 !important;
  }
`;

// Inline form editing styles
export const InlineFormItem = styled.div`
  margin: 0;
  
  .ant-form-item {
    margin: 0;
  }
`;

// Tags display container
export const TagsContainer = styled(Space)`
  // Add any specific styling for tags if needed
`;

export const MinWidthSelect = styled(Select)`
  min-width: 120px;
`;
