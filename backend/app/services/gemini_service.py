import os
from google import genai

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        # New SDK: create the client once, reuse it for every call
        self.client = genai.Client(api_key=self.api_key) if self.api_key else None

    def analyze_career(self, target_role: str, profile_data: dict) -> dict:
        # unchanged — this method doesn't call Gemini directly
        if profile_data and "market_match_index" in profile_data:
            match_index = profile_data.get("market_match_index", 75.0)
        else:
            match_index = 75.0

        if profile_data and "skill_gap" in profile_data:
            skill_gap = profile_data.get("skill_gap", [])
        else:
            skill_gap = [
                {"name": "Python", "score": 85, "benchmark": 90, "status": "Gap"},
                {"name": "System Design", "score": 75, "benchmark": 85, "status": "Gap"},
                {"name": "Algorithms", "score": 80, "benchmark": 85, "status": "Gap"}
            ]

        if profile_data and "roadmap" in profile_data:
            roadmap = profile_data.get("roadmap", [])
        else:
            roadmap = [
                {
                    "week": 1,
                    "title": "Foundational Skills",
                    "description": "Build core programming and system design fundamentals.",
                    "progress": 50,
                    "status": "IN PROGRESS"
                },
                {
                    "week": 2,
                    "title": "Advanced Topics",
                    "description": "Deep dive into specialized areas based on target role.",
                    "progress": 0,
                    "status": "LOCKED"
                }
            ]

        resources = [
            {
                "id": "r1", "type": "COURSE", "title": "Deep Learning Specialization",
                "description": "Master Neural Networks, CNNs, Transformers and Hyperparameter tuning.",
                "meta": "DeepLearning.AI • 8 Weeks",
                "imageUrl": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60",
                "link": "https://coursera.org", "typeBg": "bg-purple-500/20", "typeText": "text-purple-300"
            },
            {
                "id": "r2", "type": "YOUTUBE", "title": "MLOps Crash Course 2024",
                "description": "Deploying PyTorch models with Docker, FastAPI, and GitHub Actions.",
                "meta": "FreeCodeCamp • 1.2M Views",
                "imageUrl": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60",
                "link": "https://youtube.com", "typeBg": "bg-red-500/20", "typeText": "text-red-300"
            },
            {
                "id": "r3", "type": "DOCS", "title": "PyTorch Optimization & ONNX Runtime",
                "description": "Official guide on converting PyTorch checkpoints for high-throughput inference.",
                "meta": "PyTorch Docs • 15 Min Read",
                "imageUrl": "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=500&auto=format&fit=crop&q=60",
                "link": "https://pytorch.org", "typeBg": "bg-[#4f46e5]/20", "typeText": "text-[#c3c0ff]"
            },
            {
                "id": "r4", "type": "PROJECT", "title": "Real-time Object Detection Pipeline",
                "description": "Hands-on project: OpenCV, YOLOv8, and WebRTC streaming for edge devices.",
                "meta": "GitHub Project • 4.8★ Rating",
                "imageUrl": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60",
                "link": "https://github.com", "typeBg": "bg-emerald-500/20", "typeText": "text-emerald-300"
            }
        ]

        return {
            "target_role": target_role,
            "market_match_index": match_index,
            "skill_gap": skill_gap,
            "roadmap": roadmap,
            "resources": resources
        }

    def chat_dialogue(self, prompt: str, target_role: str = "AI Engineer", profile_data: dict = None) -> tuple[str, bool]:
        if self.client:
            try:
                ctx_str = f"Student Target Role: {target_role}. Profile Context: {profile_data if profile_data else 'Standard'}"
                response = self.client.models.generate_content(
                    model="gemini-3.5-flash",
                    contents=(
                        f"You are an elite AI Career Mentor for a university student. {ctx_str}\n"
                        f"Keep responses concise and use short bullet points where appropriate.\n"
                        f"Prompt: {prompt}"
                    ),
                )
                if response and response.text:
                    return response.text, True
            except Exception as e:
                # IMPORTANT: on Render, check the deployed logs for this exact line
                # to see the real error instead of guessing
                print(f"[GEMINI ERROR - chat_dialogue] {type(e).__name__}: {e}")

        role_title = target_role or "technical"
        if "docker" in prompt.lower():
            return f"Top {role_title} roles require containerized deployment and system architecture skills. Focus on hands-on Docker labs and deployment pipelines.", False
        elif "interview" in prompt.lower():
            return f"To excel in {role_title} technical interviews, focus on system design, performance optimization, and core DSA algorithms.", False
        else:
            return f"Prioritizing hands-on projects and practical skill application for {role_title} will strengthen your overall readiness.", False

    def ask_assistant(self, prompt: str, context: dict = None) -> tuple[str, bool]:
        if self.client:
            try:
                sys_inst = (
                    "You are Compass AI, a high-performance university student advisor. "
                    "Provide concise, actionable, encouraging advice on study planning, "
                    "career development, interview prep, skill building, and budget optimization."
                )
                response = self.client.models.generate_content(
                    model="gemini-3.5-flash",
                    contents=f"{sys_inst}\n\nStudent Query: {prompt}\nContext: {context}",
                )
                if response and response.text:
                    return response.text, True
            except Exception as e:
                # IMPORTANT: on Render, check the deployed logs for this exact line
                print(f"[GEMINI ERROR - ask_assistant] {type(e).__name__}: {e}")

        if "exam" in prompt.lower() or "os" in prompt.lower():
            return "For Operating Systems, prioritize Virtual Memory, Paging, Process Scheduling (Round Robin/CFS), and Deadlock Prevention (Banker's Algorithm). Allocate active recall practice today.", False
        elif "budget" in prompt.lower() or "canteen" in prompt.lower():
            return "Keep track of daily expenses and limit late-night delivery fees to maintain a healthy monthly budget runway.", False
        else:
            return "Based on your academic workload, prioritizing high-impact assignments tonight will keep you on track.", False

gemini_service = GeminiService()
