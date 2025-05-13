import { Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react";

const SocialTab = ({ project }) => {
  const socialMediaIcons = {
    facebook: { icon: Facebook, color: "text-blue-600" },
    instagram: { icon: Instagram, color: "text-pink-600" },
    twitter: { icon: Twitter, color: "text-blue-400" },
    linkedin: { icon: Linkedin, color: "text-blue-700" },
    youtube: { icon: Youtube, color: "text-red-600" },
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-4 sm:px-6">
        <h3 className="text-base font-medium leading-6 text-gray-900">
          Social Media Channels
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          Manage your social media accounts for this project
        </p>
      </div>
      <div className="border-t border-gray-200">
        <ul role="list" className="divide-y divide-gray-200">
          {Object.entries(project?.socialMedia || {})
            .filter(([key]) => !["_id", "other"].includes(key))
            .map(([platform, data]) => {
              const Icon = socialMediaIcons[platform]?.icon;
              const color = socialMediaIcons[platform]?.color;

              return (
                <li key={platform} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {Icon && (
                        <div className="flex-shrink-0">
                          <Icon className={`h-5 w-5 ${color}`} />
                        </div>
                      )}
                      <div className="ml-3">
                        <p className="text-xs font-medium text-gray-900 capitalize">
                          {platform}
                        </p>
                        {data?.manage && (
                          <p className="text-xs text-gray-500">
                            {data.handle}
                            {data.notes && (
                              <span className="ml-2 text-gray-400">
                                ({data.notes})
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          data?.manage
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {data?.manage ? "Managed" : "Not Managed"}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          {(!project?.socialMedia ||
            Object.keys(project.socialMedia).length === 0) && (
            <li className="px-4 py-3 text-center text-xs text-gray-500">
              No social media channels configured for this project.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default SocialTab;
