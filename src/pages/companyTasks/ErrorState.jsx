import React from "react";
import Header from "../../components/shared/header";
import Navigator from "../../components/shared/navigator";

const ErrorState = ({ title, FilterIcon, getFilterColor, error }) => {
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
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-red-800 font-semibold mb-2">
                        Error loading tasks
                    </h3>
                    <p className="text-red-600 mb-2">
                        {error?.response?.data?.message ||
                            error?.message ||
                            "An error occurred"}
                    </p>
                    <p className="text-sm text-red-500">
                        Status: {error?.response?.status || "Unknown"}
                    </p>
                </div>
            </div>
        </>
    );
};

export default ErrorState;
