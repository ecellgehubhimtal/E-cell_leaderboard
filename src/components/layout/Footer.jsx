import React from "react";
import { useLocation } from 'react-router-dom';
import {
  Instagram,
  Linkedin,
  Twitter,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";

function Footer() {
  const location = useLocation();
  const path = location.pathname;

  // Do not show footer on login, admin, or judge pages
  const hideOn = ['/login', '/admin', '/judge', '/master-login', '/profile'];
  const shouldHide = hideOn.some(p => path.endsWith(p));

  if (shouldHide) return null;

  const socialLinks = [
    {
      name: "WhatsApp",
      url: "https://chat.whatsapp.com/J0lRlhtTKLe8XEdd80KoOh?mode=ems_copy_t",
      icon: MessageCircle,
      color: "hover:text-green-500",
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/gehubhimtal_ecell/",
      icon: Instagram,
      color: "hover:text-pink-500",
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/company/gehu-ecell-official/?viewAsMember=true",
      icon: Linkedin,
      color: "hover:text-blue-600",
    },
    {
      name: "Twitter",
      url: "https://twitter.com/ecellgehubhimtal",
      icon: Twitter,
      color: "hover:text-blue-400",
    },
  ];

  return (
    <footer className="bg-[#1a2529] text-white py-12 px-6 md:px-20 border-t border-[#2a3b42] mt-auto">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
        {/* Left - Logo & About */}
        <div>
          <div className="flex items-center space-x-3 mb-5">
            <img
              src="/ecell_logo.jpg"
              alt="Entrepreneurship Cell Logo"
              width="55"
              height="55"
              className="rounded-full"
            />
            <h2 className="text-2xl font-bold text-[#BD9F67]">E-Cell GEHU</h2>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            The Entrepreneurship Cell empowers students to innovate,
            collaborate, and transform ideas into impactful ventures.
          </p>
          <p className="text-gray-500 text-xs italic">
            "Innovate • Inspire • Impact"
          </p>
        </div>

        {/* Middle - Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-[#BD9F67] mb-5 border-b border-[#2a3b42] pb-2">
            Quick Links
          </h3>
          <ul className="space-y-3 text-gray-300">
            <li>
              <a
                href="https://www.e-cellgehubhimtal.in/"
                className="hover:text-[#BD9F67] transition-colors duration-300 hover:translate-x-1 inline-block"
              >
                → Home
              </a>
            </li>
            <li>
              <a
                href="https://www.e-cellgehubhimtal.in/team"
                className="hover:text-[#BD9F67] transition-colors duration-300 hover:translate-x-1 inline-block"
              >
                → Teams
              </a>
            </li>
            <li>
              <a
                href="https://ecellgehubhimtal.in/blog"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#BD9F67] transition-colors duration-300 hover:translate-x-1 inline-block"
              >
                → Blogs
              </a>
            </li>
            <li>
              <a
                href="https://geuac-my.sharepoint.com/:f:/g/personal/chiragdwivedi_24041536_gehu_ac_in/EjrJGQWGw9ZJs3OcagzN-wEBBGzaNswBFJOOm6cxWGd5vA?e=isESJO"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#BD9F67] transition-colors duration-300 hover:translate-x-1 inline-block"
              >
                → E-Certificates
              </a>
            </li>
          </ul>
        </div>

        {/* Right - Contact & Socials */}
        <div>
          <h3 className="text-lg font-semibold text-[#BD9F67] mb-5 border-b border-[#2a3b42] pb-2">
            Connect With Us
          </h3>

          {/* Contact Info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 text-gray-300 text-sm">
              <MapPin size={18} className="text-[#BD9F67] mt-1 flex-shrink-0" />
              <p>
                Entrepreneurship Cell
                <br />
                Graphic Era Hill University, Bhimtal
              </p>
            </div>

            <div className="flex items-center gap-3 text-gray-300 text-sm">
              <Mail size={18} className="text-[#BD9F67] flex-shrink-0" />
              <a
                href="mailto:ecellgehubhimtal@gmail.com"
                className="hover:text-[#BD9F67] transition-colors"
              >
                ecellgehubhimtal@gmail.com
              </a>
            </div>
          </div>

          {/* Social Icons */}
          <div>
            <p className="text-gray-400 text-sm mb-3 font-medium">Follow Us:</p>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`bg-[#2f3d45] p-3 rounded-full text-gray-400 ${social.color} transition-all duration-300 hover:scale-110 hover:-translate-y-1`}
                    aria-label={social.name}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#2a3b42] mt-12 pt-6 text-center">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Entrepreneurship Cell, Graphic Era Hill
          University Bhimtal. All Rights Reserved.
        </p>
        <p className="text-xs text-gray-600 mt-2">
          Designed with ❤️ by Chirag Dwivedi
        </p>
      </div>
    </footer>
  );
}

export default Footer;
