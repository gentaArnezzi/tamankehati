# 🤖 AI System Overview

Comprehensive guide to the AI capabilities and features in Taman Kehati.

## Overview

The Taman Kehati AI system provides intelligent features for biodiversity management, including species identification, content generation, and data analysis. The system supports multiple AI providers and can be configured for different use cases.

## AI Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Service Layer                         │
│                 (AI Provider Factory)                       │
├─────────────────────────────────────────────────────────────┤
│                   AI Providers                              │
│              (Free, Google, OpenAI, etc.)                   │
├─────────────────────────────────────────────────────────────┤
│                    AI Features                              │
│              (Species ID, Content Gen)                     │
├─────────────────────────────────────────────────────────────┤
│                   Application Layer                         │
│                 (Frontend & Backend)                        │
└─────────────────────────────────────────────────────────────┘
```

## AI Features

### 1. Species Identification

#### Flora Identification
- **Image Analysis**: Analyze plant photos for species identification
- **Scientific Names**: Provide scientific nomenclature
- **Conservation Status**: Identify endangered or protected species
- **Habitat Information**: Provide habitat and growing conditions

#### Fauna Identification
- **Animal Recognition**: Identify animals from photos
- **Behavior Patterns**: Analyze animal behavior
- **Conservation Status**: Check species protection status
- **Habitat Requirements**: Provide habitat information

### 2. Content Generation

#### Automated Descriptions
- **Species Descriptions**: Generate detailed species information
- **Park Descriptions**: Create compelling park descriptions
- **Activity Reports**: Generate activity summaries
- **Announcements**: Create announcement content

#### Data Analysis
- **Biodiversity Reports**: Analyze species diversity
- **Trend Analysis**: Identify population trends
- **Conservation Recommendations**: Suggest conservation actions
- **Risk Assessment**: Evaluate environmental risks

## AI Providers

### Free Provider
```python
# ai/providers/free_provider.py
class FreeAIProvider:
    """Free AI provider using local models or basic algorithms"""
    
    def __init__(self):
        self.name = "free"
        self.capabilities = ["basic_analysis", "simple_classification"]
    
    async def identify_species(self, image_data: bytes, species_type: str) -> dict:
        """Basic species identification using image analysis"""
        # Implement basic image analysis
        # Return structured species data
        pass
    
    async def generate_content(self, prompt: str, content_type: str) -> str:
        """Generate content using basic templates"""
        # Implement content generation
        # Return generated text
        pass
```

### Google AI Provider
```python
# ai/providers/google_ai_provider.py
import google.generativeai as genai

class GoogleAIProvider:
    """Google AI provider using Gemini API"""
    
    def __init__(self, api_key: str):
        self.name = "google"
        self.api_key = api_key
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
    
    async def identify_species(self, image_data: bytes, species_type: str) -> dict:
        """Species identification using Google Vision API"""
        try:
            # Upload image to Google Cloud Storage
            image_url = await self.upload_image(image_data)
            
            # Use Gemini Vision for analysis
            prompt = f"""
            Analyze this {species_type} image and provide:
            1. Common name
            2. Scientific name
            3. Family/genus
            4. Conservation status
            5. Habitat information
            6. Key identifying features
            """
            
            response = self.model.generate_content([prompt, image_url])
            
            return self.parse_species_response(response.text)
            
        except Exception as e:
            raise AIProviderError(f"Google AI identification failed: {str(e)}")
    
    async def generate_content(self, prompt: str, content_type: str) -> str:
        """Generate content using Gemini"""
        try:
            system_prompt = self.get_system_prompt(content_type)
            full_prompt = f"{system_prompt}\n\n{prompt}"
            
            response = self.model.generate_content(full_prompt)
            return response.text
            
        except Exception as e:
            raise AIProviderError(f"Google AI content generation failed: {str(e)}")
```

### OpenAI Provider
```python
# ai/providers/openai_provider.py
import openai
from openai import AsyncOpenAI

class OpenAIProvider:
    """OpenAI provider using GPT and DALL-E APIs"""
    
    def __init__(self, api_key: str):
        self.name = "openai"
        self.api_key = api_key
        self.client = AsyncOpenAI(api_key=api_key)
    
    async def identify_species(self, image_data: bytes, species_type: str) -> dict:
        """Species identification using GPT-4 Vision"""
        try:
            # Convert image to base64
            import base64
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            prompt = f"""
            Analyze this {species_type} image and provide detailed information:
            1. Common name
            2. Scientific name (binomial nomenclature)
            3. Family and genus
            4. Conservation status (IUCN Red List)
            5. Habitat and distribution
            6. Key identifying features
            7. Interesting facts
            
            Format the response as JSON.
            """
            
            response = await self.client.chat.completions.create(
                model="gpt-4-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=1000,
                temperature=0.3
            )
            
            return self.parse_species_response(response.choices[0].message.content)
            
        except Exception as e:
            raise AIProviderError(f"OpenAI identification failed: {str(e)}")
    
    async def generate_content(self, prompt: str, content_type: str) -> str:
        """Generate content using GPT-4"""
        try:
            system_prompt = self.get_system_prompt(content_type)
            
            response = await self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            raise AIProviderError(f"OpenAI content generation failed: {str(e)}")
```

## AI Provider Factory

```python
# ai/providers/factory.py
from typing import Dict, Type
from ai.providers.base import BaseAIProvider
from ai.providers.free_provider import FreeAIProvider
from ai.providers.google_ai_provider import GoogleAIProvider
from ai.providers.openai_provider import OpenAIProvider

class AIProviderFactory:
    """Factory for creating AI provider instances"""
    
    _providers: Dict[str, Type[BaseAIProvider]] = {
        "free": FreeAIProvider,
        "google": GoogleAIProvider,
        "openai": OpenAIProvider,
    }
    
    @classmethod
    def create_provider(cls, provider_name: str, **kwargs) -> BaseAIProvider:
        """Create AI provider instance"""
        if provider_name not in cls._providers:
            raise ValueError(f"Unknown AI provider: {provider_name}")
        
        provider_class = cls._providers[provider_name]
        return provider_class(**kwargs)
    
    @classmethod
    def get_available_providers(cls) -> list:
        """Get list of available providers"""
        return list(cls._providers.keys())
    
    @classmethod
    def register_provider(cls, name: str, provider_class: Type[BaseAIProvider]):
        """Register a new AI provider"""
        cls._providers[name] = provider_class
```

## AI Service Implementation

### AI Service
```python
# ai/services/ai_service.py
from ai.providers.factory import AIProviderFactory
from ai.providers.base import BaseAIProvider
from core.config import settings
from typing import Optional, Dict, Any

class AIService:
    """Main AI service for handling AI operations"""
    
    def __init__(self):
        self.provider_name = settings.AI_PROVIDER
        self.provider: Optional[BaseAIProvider] = None
        self._initialize_provider()
    
    def _initialize_provider(self):
        """Initialize AI provider based on configuration"""
        try:
            if self.provider_name == "google":
                self.provider = AIProviderFactory.create_provider(
                    "google",
                    api_key=settings.GOOGLE_AI_API_KEY
                )
            elif self.provider_name == "openai":
                self.provider = AIProviderFactory.create_provider(
                    "openai",
                    api_key=settings.OPENAI_API_KEY
                )
            else:
                self.provider = AIProviderFactory.create_provider("free")
                
        except Exception as e:
            print(f"Failed to initialize AI provider: {e}")
            self.provider = AIProviderFactory.create_provider("free")
    
    async def identify_species(self, image_data: bytes, species_type: str) -> Dict[str, Any]:
        """Identify species from image"""
        if not self.provider:
            raise AIProviderError("No AI provider available")
        
        try:
            result = await self.provider.identify_species(image_data, species_type)
            return {
                "success": True,
                "data": result,
                "provider": self.provider_name
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "provider": self.provider_name
            }
    
    async def generate_content(self, prompt: str, content_type: str) -> Dict[str, Any]:
        """Generate content using AI"""
        if not self.provider:
            raise AIProviderError("No AI provider available")
        
        try:
            result = await self.provider.generate_content(prompt, content_type)
            return {
                "success": True,
                "data": result,
                "provider": self.provider_name
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "provider": self.provider_name
            }
    
    async def analyze_biodiversity(self, park_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze biodiversity data"""
        prompt = f"""
        Analyze the following biodiversity data for a park:
        
        Park Name: {park_data.get('name', 'Unknown')}
        Location: {park_data.get('location', 'Unknown')}
        Area: {park_data.get('area_hectares', 'Unknown')} hectares
        
        Flora Species: {len(park_data.get('flora', []))}
        Fauna Species: {len(park_data.get('fauna', []))}
        
        Please provide:
        1. Biodiversity assessment
        2. Conservation recommendations
        3. Potential threats
        4. Management suggestions
        """
        
        return await self.generate_content(prompt, "biodiversity_analysis")
```

## API Endpoints

### Species Identification
```python
# api/v1/endpoints/ai.py
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from ai.services.ai_service import AIService
from core.dependencies import get_current_user
from typing import Dict, Any

router = APIRouter()

@router.post("/identify-species")
async def identify_species(
    species_type: str,
    image: UploadFile = File(...),
    current_user = Depends(get_current_user)
) -> Dict[str, Any]:
    """Identify species from uploaded image"""
    
    # Validate image file
    if not image.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Read image data
    image_data = await image.read()
    
    # Initialize AI service
    ai_service = AIService()
    
    # Identify species
    result = await ai_service.identify_species(image_data, species_type)
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return result

@router.post("/generate-content")
async def generate_content(
    prompt: str,
    content_type: str,
    current_user = Depends(get_current_user)
) -> Dict[str, Any]:
    """Generate content using AI"""
    
    # Initialize AI service
    ai_service = AIService()
    
    # Generate content
    result = await ai_service.generate_content(prompt, content_type)
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return result

@router.post("/analyze-biodiversity")
async def analyze_biodiversity(
    park_id: int,
    current_user = Depends(get_current_user)
) -> Dict[str, Any]:
    """Analyze biodiversity for a park"""
    
    # Get park data
    park = await get_park_with_species(park_id)
    
    # Initialize AI service
    ai_service = AIService()
    
    # Analyze biodiversity
    result = await ai_service.analyze_biodiversity(park)
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return result
```

## Frontend Integration

### AI Hook
```typescript
// src/hooks/use-ai.ts
import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/lib/api-client';

export function useSpeciesIdentification() {
  return useMutation({
    mutationFn: ({ image, speciesType }: { image: File; speciesType: string }) =>
      aiApi.identifySpecies(image, speciesType),
  });
}

export function useContentGeneration() {
  return useMutation({
    mutationFn: ({ prompt, contentType }: { prompt: string; contentType: string }) =>
      aiApi.generateContent(prompt, contentType),
  });
}

export function useBiodiversityAnalysis() {
  return useMutation({
    mutationFn: (parkId: number) => aiApi.analyzeBiodiversity(parkId),
  });
}
```

### Species Identification Component
```typescript
// src/components/features/ai/species-identification.tsx
import { useState } from 'react';
import { useSpeciesIdentification } from '@/hooks/use-ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface SpeciesIdentificationProps {
  speciesType: 'flora' | 'fauna';
  onIdentificationComplete?: (result: any) => void;
}

export function SpeciesIdentification({ 
  speciesType, 
  onIdentificationComplete 
}: SpeciesIdentificationProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const identificationMutation = useSpeciesIdentification();

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleIdentify = () => {
    if (selectedImage) {
      identificationMutation.mutate(
        { image: selectedImage, speciesType },
        {
          onSuccess: (result) => {
            onIdentificationComplete?.(result);
          },
        }
      );
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Identify {speciesType === 'flora' ? 'Plant' : 'Animal'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {previewUrl && (
          <div className="space-y-2">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-48 object-cover rounded-md"
            />
            <Button
              onClick={handleIdentify}
              disabled={identificationMutation.isPending}
              className="w-full"
            >
              {identificationMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Identifying...
                </>
              ) : (
                'Identify Species'
              )}
            </Button>
          </div>
        )}

        {identificationMutation.isSuccess && (
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-md">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Identification complete!</span>
          </div>
        )}

        {identificationMutation.isError && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
            <XCircle className="h-4 w-4" />
            <span className="text-sm">
              {identificationMutation.error?.message || 'Identification failed'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

## Configuration

### Environment Variables
```bash
# AI Provider Configuration
AI_PROVIDER="free"  # Options: free, google, openai

# Google AI Configuration
GOOGLE_AI_API_KEY="your-google-ai-api-key"

# OpenAI Configuration
OPENAI_API_KEY="your-openai-api-key"

# AI Settings
AI_MODEL="gpt-4"
AI_MAX_TOKENS="1000"
AI_TEMPERATURE="0.7"
```

### AI Provider Settings
```python
# core/config.py
class Settings(BaseSettings):
    # AI Configuration
    AI_PROVIDER: str = "free"
    GOOGLE_AI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    
    # AI Model Settings
    AI_MODEL: str = "gpt-4"
    AI_MAX_TOKENS: int = 1000
    AI_TEMPERATURE: float = 0.7
    
    # AI Feature Flags
    ENABLE_SPECIES_IDENTIFICATION: bool = True
    ENABLE_CONTENT_GENERATION: bool = True
    ENABLE_BIODIVERSITY_ANALYSIS: bool = True
```

## Error Handling

### AI Provider Errors
```python
# ai/exceptions.py
class AIProviderError(Exception):
    """Base exception for AI provider errors"""
    pass

class AIServiceUnavailableError(AIProviderError):
    """AI service is unavailable"""
    pass

class InvalidImageError(AIProviderError):
    """Invalid image provided"""
    pass

class ContentGenerationError(AIProviderError):
    """Content generation failed"""
    pass
```

### Error Handling in Service
```python
# ai/services/ai_service.py
async def identify_species(self, image_data: bytes, species_type: str) -> Dict[str, Any]:
    """Identify species with error handling"""
    try:
        # Validate input
        if not image_data:
            raise InvalidImageError("No image data provided")
        
        if species_type not in ["flora", "fauna"]:
            raise ValueError("Invalid species type")
        
        # Check provider availability
        if not self.provider:
            raise AIServiceUnavailableError("AI provider not available")
        
        # Perform identification
        result = await self.provider.identify_species(image_data, species_type)
        
        return {
            "success": True,
            "data": result,
            "provider": self.provider_name
        }
        
    except AIProviderError as e:
        return {
            "success": False,
            "error": str(e),
            "provider": self.provider_name
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Unexpected error: {str(e)}",
            "provider": self.provider_name
        }
```

## Performance Optimization

### Caching
```python
# ai/services/ai_service.py
from functools import lru_cache
import hashlib

class AIService:
    def __init__(self):
        self.cache = {}
    
    def _get_cache_key(self, image_data: bytes, species_type: str) -> str:
        """Generate cache key for image identification"""
        image_hash = hashlib.md5(image_data).hexdigest()
        return f"species_id_{species_type}_{image_hash}"
    
    async def identify_species(self, image_data: bytes, species_type: str) -> Dict[str, Any]:
        """Identify species with caching"""
        cache_key = self._get_cache_key(image_data, species_type)
        
        # Check cache first
        if cache_key in self.cache:
            return {
                "success": True,
                "data": self.cache[cache_key],
                "provider": self.provider_name,
                "cached": True
            }
        
        # Perform identification
        result = await self._perform_identification(image_data, species_type)
        
        # Cache result
        if result["success"]:
            self.cache[cache_key] = result["data"]
        
        return result
```

### Rate Limiting
```python
# ai/services/ai_service.py
import asyncio
from datetime import datetime, timedelta

class AIService:
    def __init__(self):
        self.rate_limits = {
            "identify_species": {"limit": 10, "window": 60},  # 10 per minute
            "generate_content": {"limit": 20, "window": 60},   # 20 per minute
        }
        self.request_counts = {}
    
    def _check_rate_limit(self, operation: str) -> bool:
        """Check if operation is within rate limit"""
        if operation not in self.rate_limits:
            return True
        
        limit_info = self.rate_limits[operation]
        now = datetime.now()
        window_start = now - timedelta(seconds=limit_info["window"])
        
        # Clean old requests
        if operation in self.request_counts:
            self.request_counts[operation] = [
                req_time for req_time in self.request_counts[operation]
                if req_time > window_start
            ]
        else:
            self.request_counts[operation] = []
        
        # Check limit
        if len(self.request_counts[operation]) >= limit_info["limit"]:
            return False
        
        # Add current request
        self.request_counts[operation].append(now)
        return True
```

## Related Documentation

- [Flora & Fauna Detection](flora-fauna-detection.md)
- [AI Providers](providers.md)
- [API Documentation](../development/api-docs.md)
- [Frontend Components](../development/frontend-components.md)
