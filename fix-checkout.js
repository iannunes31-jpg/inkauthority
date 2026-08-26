const fs = require('fs');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add imports if missing
  if (!content.includes('import { useAuth }')) {
    content = content.replace(
      'import { Button }',
      'import { useAuth } from "@clerk/nextjs";\nimport { LoginModal } from "@/components/LoginModal";\nimport { useState } from "react";\nimport { Button }'
    );
  } else if (!content.includes('import { LoginModal }')) {
    content = content.replace(
      'import { Button }',
      'import { LoginModal } from "@/components/LoginModal";\nimport { Button }'
    );
  }

  // Handle courses page specific replacement
  if (filePath.includes('courses')) {
    if (!content.includes('const { isSignedIn }')) {
      content = content.replace(
        'const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);',
        'const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);\n  const { isSignedIn } = useAuth();'
      );
      content = content.replace(
        'const handleCheckout = async (productName: string, price: number) => {',
        'const handleCheckout = async (productName: string, price: number) => {\n    if (!isSignedIn) {\n      setIsLoginOpen(true);\n      return;\n    }'
      );
    }
  } else if (filePath.includes('tools')) {
    if (!content.includes('const { isSignedIn }')) {
      content = content.replace(
        'export default function ToolsPage() {',
        'export default function ToolsPage() {\n  const [isLoginOpen, setIsLoginOpen] = useState(false);\n  const { isSignedIn } = useAuth();'
      );
      content = content.replace(
        'const handleCheckout = async (productName: string, price: number, isSubscription: boolean = true) => {',
        'const handleCheckout = async (productName: string, price: number, isSubscription: boolean = true) => {\n    if (!isSignedIn) {\n      setIsLoginOpen(true);\n      return;\n    }'
      );
      
      // Inject modal before closing main
      content = content.replace(
        '</main>',
        '  <LoginModal \n        isOpen={isLoginOpen} \n        onClose={() => setIsLoginOpen(false)} \n        initialView="register" \n      />\n    </main>'
      );
    }
  }

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
}

updateFile('app/courses/page.tsx');
updateFile('app/tools/page.tsx');
