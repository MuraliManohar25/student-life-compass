import React, { useState, useEffect } from "react";
import { careerApi } from "../../services/api";

interface LearningResourcesProps {
  missingSkills: string[];
}

// LearningResources: Renders curated courses, documentation, and practice links targeting missing skills.
export const LearningResources: React.FC<LearningResourcesProps> = ({ missingSkills }) => {
  const [resourcesData, setResourcesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await careerApi.getResources();
        setResourcesData(data);
      } catch (error) {
        console.error("Failed to fetch resources:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="text-center text-[#c7c4d8] text-sm py-8">Loading learning resources...</div>
      </div>
    );
  }

  const resources = resourcesData?.resources || [];
  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-cyan-400">school</span>
          <h3 className="font-headline font-bold text-lg text-white">Recommended Learning Resources</h3>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-semibold">
          Curated for Missing Skills
        </span>
      </div>

      {resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((res: any) => (
            <a
              key={res.id}
              href={res.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition-all flex justify-between items-start group"
            >
              <div className="space-y-1 min-w-0 pr-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${res.typeBg || "bg-cyan-500/20 text-cyan-300"}`}>
                  {res.type}
                </span>
                <h4 className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors truncate">
                  {res.title}
                </h4>
                <p className="text-[11px] text-[#c7c4d8]">{res.meta}</p>
              </div>
              <span className="material-symbols-outlined text-sm text-[#c7c4d8] group-hover:translate-x-1 transition-transform shrink-0">
                open_in_new
              </span>
            </a>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-white/5 text-center text-xs text-[#c7c4d8]">
          🎉 Great job! You have no missing skills for this role, or resources will unlock as new skills are selected.
        </div>
      )}
    </div>
  );
};
