from typing import Dict, Any
from ai.providers.ollama_provider import OllamaProvider
from ai.providers.base import ChatTurn

class FloraFaunaAIService:
    def __init__(self):
        self.ollama_provider = OllamaProvider()
    
    async def generate_flora_description(self, flora_data: Dict[str, Any]) -> str:
        """
        Generate AI description for flora based on provided data
        """
        prompt = self._build_flora_prompt(flora_data)
        
        messages: list[ChatTurn] = [
            {
                "role": "system", 
                "content": "Anda adalah ahli botani Indonesia yang berpengalaman. Tugas Anda adalah membuat deskripsi yang informatif, akurat, dan menarik tentang flora Indonesia berdasarkan data yang diberikan. Deskripsi harus dalam bahasa Indonesia yang mudah dipahami oleh masyarakat umum."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
        
        return await self.ollama_provider.generate(messages)
    
    async def generate_fauna_description(self, fauna_data: Dict[str, Any]) -> str:
        """
        Generate AI description for fauna based on provided data
        """
        prompt = self._build_fauna_prompt(fauna_data)
        
        messages: list[ChatTurn] = [
            {
                "role": "system", 
                "content": "Anda adalah ahli zoologi Indonesia yang berpengalaman. Tugas Anda adalah membuat deskripsi yang informatif, akurat, dan menarik tentang fauna Indonesia berdasarkan data yang diberikan. Deskripsi harus dalam bahasa Indonesia yang mudah dipahami oleh masyarakat umum."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
        
        return await self.ollama_provider.generate(messages)
    
    def _build_flora_prompt(self, flora_data: Dict[str, Any]) -> str:
        """Build prompt for flora description generation"""
        
        # Extract available data
        local_name = flora_data.get('local_name', '')
        scientific_name = flora_data.get('scientific_name', '')
        family = flora_data.get('family', '')
        genus = flora_data.get('genus', '')
        is_endemic = flora_data.get('is_endemic', False)
        iucn_status = flora_data.get('iucn_status', '')
        
        prompt_parts = [
            "Buatkan deskripsi lengkap untuk flora dengan data berikut:",
            "",
            f"Nama Lokal: {local_name}" if local_name else "Nama Lokal: [Tidak tersedia]",
            f"Nama Ilmiah: {scientific_name}" if scientific_name else "Nama Ilmiah: [Tidak tersedia]",
            f"Famili: {family}" if family else "Famili: [Tidak tersedia]",
            f"Genus: {genus}" if genus else "Genus: [Tidak tersedia]",
            f"Status Endemik: {'Ya' if is_endemic else 'Tidak'}" if is_endemic is not None else "Status Endemik: [Tidak tersedia]",
            f"Status IUCN: {iucn_status}" if iucn_status else "Status IUCN: [Tidak tersedia]",
            "",
            "Deskripsi harus mencakup:",
            "1. Pengenalan umum tentang spesies",
            "2. Ciri-ciri morfologi utama (bentuk daun, bunga, buah, dll)",
            "3. Habitat dan distribusi",
            "4. Manfaat dan kegunaan",
            "5. Status konservasi dan ancaman",
            "6. Fakta menarik atau unik",
            "",
            "Gunakan bahasa yang informatif namun mudah dipahami. Panjang deskripsi minimal 200 kata."
        ]
        
        return "\n".join(prompt_parts)
    
    def _build_fauna_prompt(self, fauna_data: Dict[str, Any]) -> str:
        """Build prompt for fauna description generation"""
        
        # Extract available data
        local_name = fauna_data.get('local_name', '')
        scientific_name = fauna_data.get('scientific_name', '')
        family = fauna_data.get('family', '')
        genus = fauna_data.get('genus', '')
        is_endemic = fauna_data.get('is_endemic', False)
        iucn_status = fauna_data.get('iucn_status', '')
        
        prompt_parts = [
            "Buatkan deskripsi lengkap untuk fauna dengan data berikut:",
            "",
            f"Nama Lokal: {local_name}" if local_name else "Nama Lokal: [Tidak tersedia]",
            f"Nama Ilmiah: {scientific_name}" if scientific_name else "Nama Ilmiah: [Tidak tersedia]",
            f"Famili: {family}" if family else "Famili: [Tidak tersedia]",
            f"Genus: {genus}" if genus else "Genus: [Tidak tersedia]",
            f"Status Endemik: {'Ya' if is_endemic else 'Tidak'}" if is_endemic is not None else "Status Endemik: [Tidak tersedia]",
            f"Status IUCN: {iucn_status}" if iucn_status else "Status IUCN: [Tidak tersedia]",
            "",
            "Deskripsi harus mencakup:",
            "1. Pengenalan umum tentang spesies",
            "2. Ciri-ciri fisik dan morfologi",
            "3. Perilaku dan habitat",
            "4. Distribusi geografis",
            "5. Peran dalam ekosistem",
            "6. Status konservasi dan ancaman",
            "7. Fakta menarik atau unik",
            "",
            "Gunakan bahasa yang informatif namun mudah dipahami. Panjang deskripsi minimal 200 kata."
        ]
        
        return "\n".join(prompt_parts)
    
    async def generate_morphology_description(self, flora_data: Dict[str, Any]) -> str:
        """
        Generate detailed morphology description for flora
        """
        prompt = self._build_morphology_prompt(flora_data)
        
        messages: list[ChatTurn] = [
            {
                "role": "system", 
                "content": "Anda adalah ahli morfologi tumbuhan yang berpengalaman. Buatkan deskripsi morfologi yang detail dan akurat berdasarkan data yang diberikan."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
        
        return await self.ollama_provider.generate(messages)
    
    def _build_morphology_prompt(self, flora_data: Dict[str, Any]) -> str:
        """Build prompt for morphology description"""
        
        local_name = flora_data.get('local_name', '')
        scientific_name = flora_data.get('scientific_name', '')
        family = flora_data.get('family', '')
        
        prompt_parts = [
            "Buatkan deskripsi morfologi detail untuk tumbuhan:",
            "",
            f"Nama Lokal: {local_name}" if local_name else "Nama Lokal: [Tidak tersedia]",
            f"Nama Ilmiah: {scientific_name}" if scientific_name else "Nama Ilmiah: [Tidak tersedia]",
            f"Famili: {family}" if family else "Famili: [Tidak tersedia]",
            "",
            "Deskripsi morfologi harus mencakup:",
            "1. Akar (sistem perakaran, jenis akar)",
            "2. Batang (bentuk, tekstur, warna, percabangan)",
            "3. Daun (bentuk, susunan, tepi daun, permukaan)",
            "4. Bunga (bentuk, warna, susunan, bagian-bagian)",
            "5. Buah (bentuk, warna, tekstur, cara penyebaran)",
            "6. Ciri-ciri khusus yang membedakan dari spesies lain",
            "",
            "Gunakan terminologi botani yang tepat namun tetap dapat dipahami. Panjang deskripsi minimal 150 kata."
        ]
        
        return "\n".join(prompt_parts)
    
    async def generate_benefits_description(self, flora_data: Dict[str, Any]) -> str:
        """
        Generate benefits and uses description for flora
        """
        prompt = self._build_benefits_prompt(flora_data)
        
        messages: list[ChatTurn] = [
            {
                "role": "system", 
                "content": "Anda adalah ahli etnobotani Indonesia yang berpengalaman. Buatkan deskripsi tentang manfaat dan kegunaan tumbuhan berdasarkan data yang diberikan."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
        
        return await self.ollama_provider.generate(messages)
    
    def _build_benefits_prompt(self, flora_data: Dict[str, Any]) -> str:
        """Build prompt for benefits description"""
        
        local_name = flora_data.get('local_name', '')
        scientific_name = flora_data.get('scientific_name', '')
        family = flora_data.get('family', '')
        
        prompt_parts = [
            "Buatkan deskripsi manfaat dan kegunaan untuk tumbuhan:",
            "",
            f"Nama Lokal: {local_name}" if local_name else "Nama Lokal: [Tidak tersedia]",
            f"Nama Ilmiah: {scientific_name}" if scientific_name else "Nama Ilmiah: [Tidak tersedia]",
            f"Famili: {family}" if family else "Famili: [Tidak tersedia]",
            "",
            "Deskripsi manfaat harus mencakup:",
            "1. Manfaat ekonomi (kayu, obat-obatan, makanan, dll)",
            "2. Manfaat ekologi (penyedia habitat, penyerap karbon, dll)",
            "3. Manfaat budaya dan tradisional",
            "4. Manfaat ilmiah dan penelitian",
            "5. Potensi pengembangan dan pemanfaatan berkelanjutan",
            "",
            "Gunakan bahasa yang informatif dan mudah dipahami. Panjang deskripsi minimal 150 kata."
        ]
        
        return "\n".join(prompt_parts)
