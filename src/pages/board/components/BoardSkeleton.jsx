import React from "react";

const BoardSkeleton = () => {
    return (
        <div className="animate-pulse p-4">
            <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
            <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
                ))}
            </div>
        </div>
    );
};

export default BoardSkeleton;
