import React, { useState } from "react";
import { List, Tag, Space, Typography, Badge, Tooltip } from "antd";
import {
  CheckCircleOutlined,
  PlusOutlined,
  DragOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useDrag, useDrop } from 'react-dnd';

const { Text } = Typography;

const ItemTypes = {
  TIME_SLOT: 'timeSlot',
};

const TimeSlotManager = ({ date, timeSlots, dateTimeSlots, onTimeSlotClick, onCopyTimeSlot, tags }) => {
  const [draggedSlot, setDraggedSlot] = useState(null);
  const [hoverTarget, setHoverTarget] = useState(null);

  const getTagById = (tagId) => {
    return tags.find((tag) => tag.id === tagId);
  };

  // Draggable Time Slot Component
  const DraggableTimeSlot = ({ slot, slotData, hasPlanned, hasActual, isCompleted }) => {
    const [{ isDragging }, drag] = useDrag({
      type: ItemTypes.TIME_SLOT,
      item: () => {
        setDraggedSlot(slot.id);
        return {
          slotId: slot.id,
          slotData: slotData,
          sourceSlot: slot
        };
      },
      canDrag: hasPlanned || hasActual, // Only allow dragging if there's content
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: () => {
        setDraggedSlot(null);
        setHoverTarget(null);
      },
    });

    const [{ isOver, canDrop }, drop] = useDrop({
      accept: ItemTypes.TIME_SLOT,
      drop: (item) => {
        if (item.slotId !== slot.id && item.slotData) {
          onCopyTimeSlot(item.slotId, slot.id, item.slotData);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
      hover: (item) => {
        if (item.slotId !== slot.id) {
          setHoverTarget(slot.id);
        }
      },
    });

    const ref = (node) => {
      drag(drop(node));
    };

    // Determine if this slot is part of an extended activity
    const isExtended = slotData && slotData.isExtended;
    const isFirstSlot = slotData && slotData.isFirstSlot;
    const isLastSlot = slotData && slotData.isLastSlot;
    const slotIndex = slotData && slotData.slotIndex;

    // Visual styling based on drag state
    const getSlotStyle = () => {
      let baseStyle = {
        padding: "12px 16px",
        border: "1px solid #e8e8e8",
        borderRadius: "8px",
        marginBottom: "8px",
        cursor: hasPlanned || hasActual ? "grab" : "pointer",
        background: hasPlanned || hasActual ? "#fafafa" : "white",
        transition: "all 0.2s ease",
        position: "relative",
      };

      if (isDragging) {
        baseStyle.opacity = 0.5;
        baseStyle.transform = "rotate(2deg)";
      }

      if (isOver && canDrop) {
        baseStyle.background = "#e6f7ff";
        baseStyle.borderColor = "#1890ff";
        baseStyle.borderWidth = "2px";
      }

      if (draggedSlot && hoverTarget === slot.id) {
        baseStyle.background = "#f6ffed";
        baseStyle.borderColor = "#52c41a";
        baseStyle.borderWidth = "2px";
      }

      // Extended activity styling
      if (isExtended) {
        baseStyle.background = "linear-gradient(90deg, #e6f7ff 0%, #f0f9ff 100%)";
        baseStyle.borderColor = "#1890ff";

        if (isFirstSlot) {
          baseStyle.borderTopLeftRadius = "12px";
          baseStyle.borderTopRightRadius = "12px";
          baseStyle.borderBottomLeftRadius = "4px";
          baseStyle.borderBottomRightRadius = "4px";
          baseStyle.marginBottom = "2px";
        } else if (isLastSlot) {
          baseStyle.borderTopLeftRadius = "4px";
          baseStyle.borderTopRightRadius = "4px";
          baseStyle.borderBottomLeftRadius = "12px";
          baseStyle.borderBottomRightRadius = "12px";
          baseStyle.marginBottom = "8px";
        } else {
          baseStyle.borderRadius = "4px";
          baseStyle.marginBottom = "2px";
        }
      }

      return baseStyle;
    };

    return (
      <List.Item
        ref={ref}
        key={slot.id}
        style={getSlotStyle()}
        onClick={() => !isDragging && onTimeSlotClick(slot)}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }
        }}
      >
        <div style={{ width: "100%" }}>
          {/* Drag handle for activities with content */}
          {(hasPlanned || hasActual) && (
            <div style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              color: "#999",
              fontSize: "12px"
            }}>
              <DragOutlined />
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <Text strong style={{ color: "#1e293b" }}>
              {isExtended && isFirstSlot ? slotData.extendedTimeRange : slot.display}
              {isExtended && slotData.duration && isFirstSlot && (
                <Text type="secondary" style={{ fontSize: "12px", marginLeft: "8px" }}>
                  ({slotData.duration}h)
                </Text>
              )}
            </Text>
            <Space>
              {isCompleted && (
                <CheckCircleOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
              )}
              {hasPlanned && (
                <Badge
                  count="P"
                  style={{ backgroundColor: "#1890ff", fontSize: "10px", minWidth: "16px", height: "16px", lineHeight: "16px" }}
                />
              )}
              {hasActual && (
                <Badge
                  count="A"
                  style={{ backgroundColor: "#fa8c16", fontSize: "10px", minWidth: "16px", height: "16px", lineHeight: "16px" }}
                />
              )}
              {isExtended && (
                <Badge
                  count="E"
                  title="Extended Activity"
                  style={{ backgroundColor: "#722ed1", fontSize: "10px", minWidth: "16px", height: "16px", lineHeight: "16px" }}
                />
              )}
            </Space>
          </div>

          {/* Only show content details on first slot of extended activities */}
          {(!isExtended || isFirstSlot) && hasPlanned && (
            <div style={{ marginBottom: "8px" }}>
              <Text type="secondary" style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>
                Planned:
              </Text>
              <Text style={{ fontSize: "13px", display: "block", marginBottom: "4px" }}>
                {slotData.planned}
              </Text>
              {slotData.plannedTags && slotData.plannedTags.length > 0 && (
                <Space size={4} wrap>
                  {slotData.plannedTags.map((tagId) => {
                    const tag = getTagById(tagId);
                    return tag ? (
                      <Tag key={tagId} color={tag.color} size="small">
                        {tag.name}
                      </Tag>
                    ) : null;
                  })}
                </Space>
              )}
            </div>
          )}

          {(!isExtended || isFirstSlot) && hasActual && (
            <div style={{ marginBottom: "8px" }}>
              <Text type="secondary" style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>
                Actual:
              </Text>
              <Text style={{ fontSize: "13px", display: "block", marginBottom: "4px" }}>
                {slotData.actual}
              </Text>
              {slotData.actualTags && slotData.actualTags.length > 0 && (
                <Space size={4} wrap>
                  {slotData.actualTags.map((tagId) => {
                    const tag = getTagById(tagId);
                    return tag ? (
                      <Tag key={tagId} color={tag.color} size="small">
                        {tag.name}
                      </Tag>
                    ) : null;
                  })}
                </Space>
              )}
            </div>
          )}

          {(!isExtended || isFirstSlot) && slotData && slotData.notes && (
            <div>
              <Text type="secondary" style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>
                Notes:
              </Text>
              <Text style={{ fontSize: "13px", fontStyle: "italic", color: "#666" }}>
                {slotData.notes}
              </Text>
            </div>
          )}

          {/* Extended activity continuation indicator */}
          {isExtended && !isFirstSlot && (
            <div style={{ textAlign: "center", padding: "4px", color: "#1890ff", fontSize: "12px" }}>
              <ClockCircleOutlined style={{ marginRight: "4px" }} />
              Continuing: {slotData.planned || slotData.actual}
            </div>
          )}

          {!hasPlanned && !hasActual && (
            <div style={{ textAlign: "center", padding: "8px", color: "#999" }}>
              <PlusOutlined style={{ marginRight: "8px" }} />
              Click to add activity
            </div>
          )}
        </div>
      </List.Item>
    );
  };

  const renderTimeSlot = (slot) => {
    const slotData = dateTimeSlots[slot.id];
    const hasPlanned = slotData && slotData.planned;
    const hasActual = slotData && slotData.actual;
    const isCompleted = slotData && slotData.completed;

    return (
      <DraggableTimeSlot
        key={slot.id}
        slot={slot}
        slotData={slotData}
        hasPlanned={hasPlanned}
        hasActual={hasActual}
        isCompleted={isCompleted}
      />
    );
  };

  return (
    <div style={{ maxHeight: "600px", overflowY: "auto" }}>
      {draggedSlot && (
        <div style={{
          padding: "8px 12px",
          background: "#e6f7ff",
          borderRadius: "6px",
          marginBottom: "12px",
          fontSize: "12px",
          color: "#1890ff",
          textAlign: "center"
        }}>
          <DragOutlined style={{ marginRight: "6px" }} />
          Drag to another time slot to extend this activity
        </div>
      )}
      {timeSlots.map(renderTimeSlot)}
    </div>
  );
};

export default TimeSlotManager;
