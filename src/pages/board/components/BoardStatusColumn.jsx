import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useBoardColumn } from "../hooks/useBoardQueries";
import DroppableColumn from "./DroppableColumn";
import DraggableTask from "./DraggableTask";
import { ShimmerBox } from "./BoardSkeleton";

const BoardStatusColumn = ({
  status,
  config,
  filters,
  enabled,
  count = 0,
  onDrop,
}) => {
  const navigate = useNavigate();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useBoardColumn(status, filters, enabled);

  const columnTasks = data?.pages?.flatMap((page) => page.items || []) || [];

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <DroppableColumn
      id={status}
      title={
        <span className="inline-flex items-center justify-center gap-1.5">
          {config.title}
          {isLoading && !count ? (
            <ShimmerBox className="h-3.5 w-7" />
          ) : (
            <span>({count})</span>
          )}
        </span>
      }
      onDrop={onDrop}
      tasks={columnTasks}
      emptyLabel={`No ${config.title.toLowerCase()}`}
      hasMore={!!hasNextPage}
      isFetchingMore={isFetchingNextPage}
      isLoading={isLoading}
      onLoadMore={handleLoadMore}
    >
      {columnTasks.map((task, index) => (
        <DraggableTask
          key={task._id}
          task={task}
          index={index}
          onClick={(t) => {
            if (t?.parentTask) {
              navigate(
                t.project
                  ? `/projects/${t.project._id}/${t.parentTask._id}`
                  : `/tasks/${t.parentTask._id}`
              );
            } else if (t.project) {
              navigate(`/projects/${t.project._id}/${t._id}`);
            } else {
              navigate(`/tasks/${t._id}`);
            }
          }}
        />
      ))}
    </DroppableColumn>
  );
};

export default BoardStatusColumn;
