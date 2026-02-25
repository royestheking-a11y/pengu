import React from 'react';
import { Mail, Phone, Globe, User } from 'lucide-react';

interface ResumeData {
    personal: {
        name: string;
        title: string;
        phone: string;
        email: string;
        website: string;
    };
    education: {
        degree: string;
        institution: string;
        year: string;
    }[];
    expertise: string[];
    languages: string[];
    profileSummary: string;
    workExperience: {
        company: string;
        role: string;
        year: string;
        achievements: string[];
    }[];
    references: {
        name: string;
        company: string;
        role: string;
        phone: string;
        email: string;
    }[];
}

interface ResumePreviewProps {
    data: ResumeData;
    scale?: number;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, scale = 1 }) => {
    return (
        <div
            className="bg-[#ffffff] mx-auto relative overflow-hidden"
            style={{
                width: `${794 * scale}px`, // A4 Width in pixels at 96 DPI
                minHeight: `${1123 * scale}px`, // A4 Height
                transform: `scale(${scale})`,
                transformOrigin: 'top center',
                fontFamily: 'Arial, Helvetica, sans-serif' // Explicit standard font prevents html2canvas squishing bugs
            }}
            id="resume-pdf-target"
        >
            <div className="flex flex-col h-full bg-[#ffffff] text-[#1c1917]" style={{ letterSpacing: 'normal', wordSpacing: 'normal' }}>

                {/* HEADER */}
                <div className="w-full pt-16 pb-8 px-12 flex items-center justify-start gap-8">
                    {/* Dynamic Image Placeholder Box */}
                    <div className="w-32 h-36 bg-[#f5f5f4] border-2 border-dashed border-[#d6d3d1] shrink-0 flex flex-col items-center justify-center text-[#a8a29e]">
                        <User className="size-8 mb-2 opacity-50" />
                        <span className="text-[10px] font-bold uppercase">Add Photo</span>
                    </div>

                    {/* Name & Contact Info */}
                    <div className="flex-1 flex flex-col justify-center">
                        <h1 className="text-[44px] leading-none font-black text-[#1c1917] uppercase mb-2">
                            {data.personal.name}
                        </h1>
                        <p className="text-xl text-[#57534e] font-bold uppercase mb-6">
                            {data.personal.title}
                        </p>

                        <div className="flex items-center gap-6 text-xs text-[#44403c] font-medium flex-wrap">
                            {data.personal.phone && (
                                <div className="flex items-center gap-2">
                                    <div className="bg-[#292524] p-1.5 rounded-sm">
                                        <Phone className="size-3 text-[#ffffff]" />
                                    </div>
                                    <span>{data.personal.phone}</span>
                                </div>
                            )}
                            {data.personal.email && (
                                <div className="flex items-center gap-2">
                                    <div className="bg-[#292524] p-1.5 rounded-sm">
                                        <Mail className="size-3 text-[#ffffff]" />
                                    </div>
                                    <span>{data.personal.email}</span>
                                </div>
                            )}
                            {data.personal.website && data.personal.website !== "Available upon request" && (
                                <div className="flex items-center gap-2">
                                    <div className="bg-[#292524] p-1.5 rounded-sm">
                                        <Globe className="size-3 text-[#ffffff]" />
                                    </div>
                                    <span>{data.personal.website}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full px-12">
                    <div className="h-px w-full bg-[#d6d3d1]"></div>
                </div>

                {/* BODY (2 Columns) */}
                <div className="flex flex-1 px-12 py-10 gap-10">

                    {/* L SIDEBAR */}
                    <div className="w-1/3 flex flex-col gap-10 pr-6 border-r border-[#e7e5e4]">
                        {/* Education */}
                        {data.education && data.education.length > 0 && (
                            <div>
                                <h2 className="text-lg font-black text-[#1c1917] uppercase mb-6">Education</h2>
                                <div className="space-y-6">
                                    {data.education.map((edu, idx) => (
                                        <div key={idx} className="flex flex-col">
                                            <span className="font-bold text-[#1c1917]">{edu.degree}</span>
                                            <span className="text-[#292524] font-medium text-sm mt-1">{edu.institution}</span>
                                            <span className="text-[#78716c] text-[13px] mt-0.5">{edu.year}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Expertise */}
                        {data.expertise && data.expertise.length > 0 && (
                            <div>
                                <h2 className="text-lg font-black text-[#1c1917] uppercase mb-6">Expertise</h2>
                                <ul className="space-y-3">
                                    {data.expertise.map((skill, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-[#292524] text-[14px] font-medium">
                                            <div className="size-1.5 bg-[#292524] rounded-full shrink-0" />
                                            {skill}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Languages */}
                        {data.languages && data.languages.length > 0 && (
                            <div>
                                <h2 className="text-lg font-black text-[#1c1917] uppercase mb-6">Language</h2>
                                <ul className="space-y-3">
                                    {data.languages.map((lang, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-[#292524] text-[14px] font-medium">
                                            <div className="size-1.5 bg-[#292524] rounded-full shrink-0" />
                                            {lang}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* R MAIN CONTENT */}
                    <div className="w-2/3 flex flex-col gap-10">

                        {/* Profile */}
                        {data.profileSummary && (
                            <div>
                                <h2 className="text-lg font-black text-[#1c1917] uppercase mb-4">Profile</h2>
                                <p className="text-[#57534e] leading-relaxed text-[14px]">
                                    {data.profileSummary}
                                </p>
                            </div>
                        )}

                        {/* Work Experience */}
                        {data.workExperience && data.workExperience.length > 0 && (
                            <div>
                                <h2 className="text-lg font-black text-[#1c1917] uppercase mb-6">Work Experience</h2>
                                <div className="space-y-8">
                                    {data.workExperience.map((work, idx) => (
                                        <div key={idx}>
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className="font-bold text-[#1c1917] text-[16px]">{work.role}</h3>
                                                <span className="text-[#1c1917] font-bold text-sm bg-stone-100 px-2 py-0.5 rounded-sm">{work.year}</span>
                                            </div>
                                            <p className="text-[#57534e] text-[15px] font-bold mb-3">{work.company}</p>
                                            <ul className="space-y-2">
                                                {work.achievements && work.achievements.map((ach, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-[#44403c] text-[14px]">
                                                        <div className="size-1 bg-[#57534e] rounded-sm shrink-0 mt-2" />
                                                        <span className="leading-snug">{ach}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* References */}
                        {data.references && data.references.length > 0 && (
                            <div>
                                <h2 className="text-lg font-black text-[#1c1917] uppercase mb-6">References</h2>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                                    {data.references.map((ref, idx) => (
                                        <div key={idx} className="flex flex-col text-[14px]">
                                            <span className="font-bold text-[#1c1917] text-[15px] mb-0.5">{ref.name}</span>
                                            <span className="text-[#57534e] mb-3">{ref.company} — {ref.role}</span>

                                            {ref.phone && ref.phone !== "Available upon request" && (
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <span className="font-bold text-[#1c1917] text-[11px] uppercase">Phone:</span>
                                                    <span className="text-[#78716c]">{ref.phone}</span>
                                                </div>
                                            )}
                                            {ref.email && ref.email !== "Available upon request" && (
                                                <div className="flex items-center gap-1.5 border-t border-stone-100 pt-1">
                                                    <span className="font-bold text-[#1c1917] text-[11px] uppercase">Email:</span>
                                                    <span className="text-[#78716c]">{ref.email}</span>
                                                </div>
                                            )}
                                            {(!ref.phone || ref.phone === "Available upon request") && (!ref.email || ref.email === "Available upon request") && (
                                                <div className="text-[#78716c] italic text-xs mt-1">Available upon request</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
