import React from "react";
import Header from "../../components/shared/header";
import Navigator from "../../components/shared/navigator";

const LoadingState = ({ title, FilterIcon, getFilterColor }) => {
    return (
        <>
            <Header />
            <Navigator />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FilterIcon className={getFilterColor()} />
                        {title}
                    </h1>
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="bg-white rounded-lg shadow p-6 animate-pulse"
                        >
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default LoadingState;
