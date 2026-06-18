// frontend/src/components/layout/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-6 mt-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">© {new Date().getFullYear()} CareerConnect Pro. All rights reserved.</p>
        <div className="flex gap-4 mt-2 md:mt-0">
          <a href="#" className="hover:text-white text-sm">Privacy Policy</a>
          <a href="#" className="hover:text-white text-sm">Terms of Service</a>
          <a href="#" className="hover:text-white text-sm">Contact</a>
        </div>
      </div>
    </footer>
  );
}