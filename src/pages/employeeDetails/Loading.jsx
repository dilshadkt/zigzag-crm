import Header from "@/components/shared/header"

export const Loading = () => {
    return <section className="flex flex-col h-full gap-y-3">
        <Header>Employee's Profile</Header>
        <div className="w-full h-full overflow-hidden gap-x-5 flex">
            {/* User Profile Skeleton */}
            <div className="w-full md:w-[250px] bg-white rounded-3xl p-5 flex flex-col gap-6 animate-pulse">
                <div className="flex flex-col border-b border-gray-100 pb-5 gap-3">
                    <div className="flex justify-between items-start">
                        <div className="h-[54px] w-[54px] rounded-full bg-gray-200" />
                        <div className="h-10 w-10 rounded-xl bg-gray-200" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-5 w-3/4 bg-gray-200 rounded" />
                        <div className="h-3 w-1/2 bg-gray-200 rounded" />
                    </div>
                </div>
                <div className="flex flex-col gap-4 overflow-hidden">
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-3 w-16 bg-gray-200 rounded" />
                            <div className="h-10 w-full bg-gray-200 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Content Skeleton */}
            <div className="flex-1 flex flex-col gap-y-5">
                <div className="flex justify-between items-center">
                    <div className="flex bg-[#E6EDF5] rounded-full p-1 gap-1">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-9 w-24 bg-gray-200 rounded-full animate-pulse" />
                        ))}
                    </div>
                    <div className="h-9 w-32 bg-gray-200 rounded-lg animate-pulse" />
                </div>

                <div className="w-full h-full overflow-hidden animate-pulse">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-40 bg-gray-200 rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </section>
}