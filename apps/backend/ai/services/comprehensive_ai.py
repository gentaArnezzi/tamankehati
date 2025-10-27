from typing import Dict, Any, List, Tuple
import json
import re
from datetime import datetime
from difflib import SequenceMatcher
from collections import Counter
from ai.providers.ollama_provider import OllamaProvider
from ai.providers.base import ChatTurn

# Try to import pandas, fallback to basic CSV handling if not available
try:
    import pandas as pd
    PANDAS_AVAILABLE = True
    DataFrame = pd.DataFrame
except ImportError:
    PANDAS_AVAILABLE = False
    import csv
    import io
    # Create a dummy DataFrame type for type hints
    DataFrame = Any

# Try to import scikit-learn for advanced data processing
try:
    from sklearn.ensemble import IsolationForest
    from sklearn.impute import KNNImputer
    from sklearn.preprocessing import StandardScaler
    import numpy as np
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    np = None

class AdvancedDataProcessor:
    """Advanced data processing for CSV extraction with ML-based cleaning and enrichment"""
    
    def __init__(self):
        self.outlier_detector = None
        self.imputer = None
        self.scaler = None
        
    def detect_outliers(self, data: List[Dict[str, Any]], numeric_columns: List[str]) -> Dict[str, List[int]]:
        """Detect outliers using Isolation Forest"""
        if not SKLEARN_AVAILABLE or not numeric_columns:
            return {}
        
        outliers = {}
        try:
            # Prepare numeric data
            numeric_data = []
            for row in data:
                row_values = []
                for col in numeric_columns:
                    value = row.get(col, '')
                    try:
                        row_values.append(float(value) if value else 0)
                    except (ValueError, TypeError):
                        row_values.append(0)
                numeric_data.append(row_values)
            
            if not numeric_data:
                return {}
            
            # Detect outliers
            self.outlier_detector = IsolationForest(contamination=0.1, random_state=42)
            outlier_labels = self.outlier_detector.fit_predict(numeric_data)
            
            # Group outliers by column
            for i, col in enumerate(numeric_columns):
                outliers[col] = [j for j, label in enumerate(outlier_labels) if label == -1]
                
        except Exception as e:
            print(f"Outlier detection failed: {e}")
            
        return outliers
    
    def impute_missing_values(self, data: List[Dict[str, Any]], numeric_columns: List[str]) -> List[Dict[str, Any]]:
        """Impute missing values using KNN imputation"""
        if not SKLEARN_AVAILABLE or not numeric_columns:
            return data
        
        try:
            # Prepare data for imputation
            numeric_data = []
            for row in data:
                row_values = []
                for col in numeric_columns:
                    value = row.get(col, '')
                    try:
                        if np is not None:
                            row_values.append(float(value) if value else np.nan)
                        else:
                            row_values.append(float(value) if value else 0)
                    except (ValueError, TypeError):
                        if np is not None:
                            row_values.append(np.nan)
                        else:
                            row_values.append(0)
                numeric_data.append(row_values)
            
            if not numeric_data:
                return data
            
            # Impute missing values
            self.imputer = KNNImputer(n_neighbors=3)
            imputed_data = self.imputer.fit_transform(numeric_data)
            
            # Update original data
            for i, row in enumerate(data):
                for j, col in enumerate(numeric_columns):
                    if np is not None and np.isnan(numeric_data[i][j]):
                        row[col] = str(imputed_data[i][j])
                        
        except Exception as e:
            print(f"Missing value imputation failed: {e}")
            
        return data
    
    def normalize_data(self, data: List[Dict[str, Any]], numeric_columns: List[str]) -> List[Dict[str, Any]]:
        """Normalize numeric data using StandardScaler"""
        if not SKLEARN_AVAILABLE or not numeric_columns:
            return data
        
        try:
            # Prepare data for normalization
            numeric_data = []
            for row in data:
                row_values = []
                for col in numeric_columns:
                    value = row.get(col, '')
                    try:
                        row_values.append(float(value) if value else 0)
                    except (ValueError, TypeError):
                        row_values.append(0)
                numeric_data.append(row_values)
            
            if not numeric_data:
                return data
            
            # Normalize data
            self.scaler = StandardScaler()
            normalized_data = self.scaler.fit_transform(numeric_data)
            
            # Update original data
            for i, row in enumerate(data):
                for j, col in enumerate(numeric_columns):
                    row[col] = str(normalized_data[i][j])
                    
        except Exception as e:
            print(f"Data normalization failed: {e}")
            
        return data
    
    def clean_text_data(self, data: List[Dict[str, Any]], text_columns: List[str]) -> List[Dict[str, Any]]:
        """Clean and normalize text data"""
        for row in data:
            for col in text_columns:
                if col in row and row[col]:
                    # Remove extra whitespace
                    row[col] = re.sub(r'\s+', ' ', str(row[col]).strip())
                    # Remove special characters but keep basic punctuation
                    row[col] = re.sub(r'[^\w\s\-.,()]', '', row[col])
                    # Capitalize first letter
                    row[col] = row[col].capitalize()
        return data
    
    def validate_data_types(self, data: List[Dict[str, Any]], schema: Dict[str, str]) -> List[Dict[str, Any]]:
        """Validate and convert data types according to schema"""
        for row in data:
            for field, expected_type in schema.items():
                if field in row and row[field]:
                    try:
                        if expected_type == 'int':
                            row[field] = int(float(row[field]))
                        elif expected_type == 'float':
                            row[field] = float(row[field])
                        elif expected_type == 'bool':
                            value = str(row[field]).lower()
                            row[field] = value in ['true', '1', 'yes', 'y', 't']
                        elif expected_type == 'date':
                            # Try to parse various date formats
                            date_str = str(row[field])
                            for fmt in ['%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%Y-%m-%d %H:%M:%S']:
                                try:
                                    row[field] = datetime.strptime(date_str, fmt).isoformat()
                                    break
                                except ValueError:
                                    continue
                    except (ValueError, TypeError):
                        # Keep original value if conversion fails
                        pass
        return data

class EntityResolver:
    """Entity resolution and enrichment for flora/fauna data"""
    
    def __init__(self):
        # Reference data for entity linking
        self.flora_reference = {
            "tectona grandis": {"id": 1, "common_names": ["teak", "jati", "teak tree"]},
            "phalaenopsis amabilis": {"id": 2, "common_names": ["moon orchid", "anggrek bulan"]},
            "rafflesia arnoldii": {"id": 3, "common_names": ["rafflesia", "corpse flower"]},
        }
        
        self.fauna_reference = {
            "panthera tigris sumatrae": {"id": 1, "common_names": ["sumatran tiger", "harimau sumatera"]},
            "elephas maximus sumatranus": {"id": 2, "common_names": ["sumatran elephant", "gajah sumatera"]},
            "pongo abelii": {"id": 3, "common_names": ["sumatran orangutan", "orangutan sumatera"]},
        }
        
        # IUCN status mapping
        self.iucn_status = {
            "LC": "Least Concern",
            "NT": "Near Threatened", 
            "VU": "Vulnerable",
            "EN": "Endangered",
            "CR": "Critically Endangered",
            "EW": "Extinct in the Wild",
            "EX": "Extinct"
        }
    
    def resolve_entity(self, scientific_name: str, common_name: str = "") -> Dict[str, Any]:
        """Resolve entity to reference data"""
        scientific_lower = scientific_name.lower().strip()
        common_lower = common_name.lower().strip()
        
        # Check flora reference
        for sci_name, data in self.flora_reference.items():
            if sci_name in scientific_lower or any(common in common_lower for common in data["common_names"]):
                return {
                    "type": "flora",
                    "reference_id": data["id"],
                    "scientific_name": scientific_name,
                    "common_name": common_name,
                    "resolved": True
                }
        
        # Check fauna reference
        for sci_name, data in self.fauna_reference.items():
            if sci_name in scientific_lower or any(common in common_lower for common in data["common_names"]):
                return {
                    "type": "fauna", 
                    "reference_id": data["id"],
                    "scientific_name": scientific_name,
                    "common_name": common_name,
                    "resolved": True
                }
        
        # If not found, return unresolved
        return {
            "type": "unknown",
            "reference_id": None,
            "scientific_name": scientific_name,
            "common_name": common_name,
            "resolved": False
        }
    
    def enrich_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Enrich data with additional information"""
        enriched = data.copy()
        
        # Enrich IUCN status
        if "status_iucn" in enriched and enriched["status_iucn"]:
            status_code = enriched["status_iucn"].upper()
            if status_code in self.iucn_status:
                enriched["iucn_description"] = self.iucn_status[status_code]
        
        # Enrich endemic status
        if "is_endemic" in enriched:
            endemic_value = str(enriched["is_endemic"]).lower()
            if endemic_value in ["true", "1", "yes", "y"]:
                enriched["endemic_status"] = "Endemic to Indonesia"
            else:
                enriched["endemic_status"] = "Not endemic"
        
        # Add timestamp
        enriched["processed_at"] = datetime.now().isoformat()
        
        return enriched
    
    def validate_entity(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate entity data and add validation flags"""
        validation = {
            "has_scientific_name": bool(data.get("nama_ilmiah") or data.get("scientific_name")),
            "has_common_name": bool(data.get("nama_lokal") or data.get("common_name")),
            "has_family": bool(data.get("famili") or data.get("family")),
            "has_genus": bool(data.get("genus")),
            "has_habitat": bool(data.get("habitat") or data.get("environment")),
            "has_description": bool(data.get("deskripsi") or data.get("description")),
            "is_valid": True
        }
        
        # Overall validation
        validation["is_valid"] = (
            validation["has_scientific_name"] and 
            validation["has_common_name"] and
            validation["has_family"]
        )
        
        data["validation"] = validation
        return data

class IntelligentColumnMapper:
    """Advanced column mapping system with fuzzy matching and semantic analysis"""
    
    def __init__(self):
        # Database schema mappings
        self.flora_schema = {
            'local_name': ['local_name', 'nama_lokal', 'common_name', 'indonesian_name', 'nama_umum', 'species_name', 'local', 'common', 'local_species_name', 'common_name_indonesia', 'species_identified', 'local_species', 'common_name_indonesia', 'species_name_indonesia', 'local_species_name', 'species_local_name', 'local_species_name', 'species_name_local', 'local_species_name', 'species_common_name_indonesian', 'common_name_indonesian', 'indonesian_common_name'],
            'scientific_name': ['scientific_name', 'nama_ilmiah', 'latin_name', 'binomial', 'species', 'scientific', 'latin', 'binomial_name', 'scientific_classification', 'latin_binomial', 'latin_name', 'scientific_name_full', 'scientific_binomial_name', 'binomial_name', 'latin_binomial_name'],
            'family': ['family', 'famili', 'familia', 'family_name', 'taxonomic_family', 'family_group', 'family_group_name', 'family_classification', 'taxonomic_family_classification'],
            'genus': ['genus', 'gen', 'genus_name', 'taxonomic_genus', 'genus_classification'],
            'species': ['species', 'spesies', 'species_name', 'specific_name', 'species_classification'],
            'iucn_status': ['iucn_status', 'status_iucn', 'conservation_status', 'red_list', 'conservation', 'status', 'iucn', 'iucn_red_list', 'red_list_status', 'iucn_red_list_status', 'red_list_conservation_status'],
            'is_endemic': ['is_endemic', 'endemic', 'endemik', 'endemism', 'endemic_status', 'is_endemic_indonesia', 'endemic_flag', 'is_endemic_indonesia', 'endemic_indonesia', 'endemic_status_indonesia', 'indonesia_endemic_status'],
            'habitat': ['habitat', 'tempat', 'lingkungan', 'environment', 'habitat_type', 'environment_type', 'habitat_description', 'environment_description', 'natural_habitat_type', 'habitat_environment', 'natural_habitat'],
            'description': ['description', 'deskripsi', 'keterangan', 'info', 'detail', 'notes', 'remarks', 'additional_info', 'description_notes', 'additional_notes', 'physical_description_text', 'description_text', 'physical_description'],
            'morphology': ['morphology', 'morfologi', 'physical_description', 'appearance', 'characteristics', 'physical_characteristics', 'morphological_description'],
            'benefits': ['benefits', 'manfaat', 'uses', 'kegunaan', 'utility', 'benefits_and_uses', 'uses_and_benefits', 'economic_benefits'],
            'uses': ['uses', 'penggunaan', 'utilization', 'application', 'practical_uses', 'utilization_uses']
        }
        
        self.fauna_schema = {
            'local_name': ['local_name', 'nama_lokal', 'common_name', 'indonesian_name', 'nama_umum', 'species_name', 'local', 'common', 'local_species_name', 'common_name_indonesia', 'species_identified'],
            'scientific_name': ['scientific_name', 'nama_ilmiah', 'latin_name', 'binomial', 'species', 'scientific', 'latin', 'binomial_name', 'scientific_classification', 'latin_binomial'],
            'family': ['family', 'famili', 'familia', 'family_name', 'taxonomic_family', 'family_group'],
            'genus': ['genus', 'gen', 'genus_name', 'taxonomic_genus'],
            'species': ['species', 'spesies', 'species_name', 'specific_name'],
            'ordo': ['ordo', 'order', 'ordo_hewan', 'animal_order', 'taxonomic_order'],
            'iucn_status': ['iucn_status', 'status_iucn', 'conservation_status', 'red_list', 'conservation', 'status', 'iucn', 'iucn_red_list'],
            'is_endemic': ['is_endemic', 'endemic', 'endemik', 'endemism', 'endemic_status', 'is_endemic_indonesia', 'endemic_flag'],
            'habitat': ['habitat', 'tempat', 'lingkungan', 'environment', 'habitat_type', 'environment_type', 'habitat_description'],
            'description': ['description', 'deskripsi', 'keterangan', 'info', 'detail', 'notes', 'remarks', 'additional_info', 'description_notes'],
            'diet': ['diet', 'makanan', 'food', 'feeding', 'nutrition'],
            'behavior': ['behavior', 'perilaku', 'behaviour', 'characteristics', 'traits'],
            'morphology': ['morphology', 'morfologi', 'physical_description', 'appearance', 'characteristics']
        }
        
        self.articles_schema = {
            'title': ['title', 'judul', 'headline', 'nama_artikel', 'article_title', 'headline_title'],
            'content': ['content', 'konten', 'isi', 'body', 'text', 'article_content', 'main_content'],
            'category': ['category', 'kategori', 'type', 'jenis_artikel', 'article_type', 'content_type'],
            'summary': ['summary', 'ringkasan', 'abstract', 'resume', 'overview'],
            'featured_image': ['featured_image', 'gambar_utama', 'main_image', 'cover_image', 'thumbnail']
        }
        
        # Type classification patterns
        self.flora_patterns = ['plantae', 'fungi', 'plant', 'tumbuhan', 'flora', 'vegetation', 'tree', 'shrub', 'herb', 'flower', 'leaf', 'root', 'stem']
        self.fauna_patterns = ['animalia', 'mammalia', 'aves', 'reptilia', 'amphibia', 'insecta', 'arachnida', 'mollusca', 'animal', 'fauna', 'mammal', 'bird', 'reptile', 'amphibian', 'insect', 'spider', 'fish']
    
    def fuzzy_match(self, text1: str, text2: str) -> float:
        """Calculate fuzzy matching score between two strings"""
        return SequenceMatcher(None, text1.lower(), text2.lower()).ratio()
    
    def find_best_match(self, column_name: str, schema_field: str, patterns: List[str]) -> Tuple[float, str]:
        """Find the best matching pattern for a column name"""
        best_score = 0.0
        best_pattern = ""
        
        for pattern in patterns:
            # Direct match
            if column_name.lower() == pattern.lower():
                return 1.0, pattern
            
            # Fuzzy match
            score = self.fuzzy_match(column_name, pattern)
            if score > best_score:
                best_score = score
                best_pattern = pattern
        
        return best_score, best_pattern
    
    def analyze_column_content(self, column_data: List[str], column_name: str) -> Dict[str, Any]:
        """Analyze column content to determine data type and characteristics"""
        if not column_data:
            return {'type': 'unknown', 'confidence': 0.0}
        
        # Clean and analyze data
        clean_data = [str(item).strip().lower() for item in column_data if item and str(item).strip()]
        if not clean_data:
            return {'type': 'unknown', 'confidence': 0.0}
        
        # Check for scientific names (contains genus species pattern)
        scientific_pattern = r'^[A-Z][a-z]+\s+[a-z]+'
        scientific_count = sum(1 for item in clean_data if re.match(scientific_pattern, item))
        scientific_ratio = scientific_count / len(clean_data)
        
        # Check for common patterns
        flora_matches = sum(1 for item in clean_data if any(pattern in item for pattern in self.flora_patterns))
        fauna_matches = sum(1 for item in clean_data if any(pattern in item for pattern in self.fauna_patterns))
        
        # Check for numeric patterns
        numeric_count = sum(1 for item in clean_data if item.replace('.', '').replace('-', '').isdigit())
        numeric_ratio = numeric_count / len(clean_data)
        
        # Check for boolean patterns
        boolean_count = sum(1 for item in clean_data if item in ['true', 'false', 'yes', 'no', '1', '0', 'ya', 'tidak'])
        boolean_ratio = boolean_count / len(clean_data)
        
        # Determine type based on analysis
        if scientific_ratio > 0.7:
            return {
                'type': 'scientific_name',
                'confidence': scientific_ratio,
                'is_flora': flora_matches > fauna_matches,
                'is_fauna': fauna_matches > flora_matches
            }
        elif numeric_ratio > 0.8:
            return {
                'type': 'numeric',
                'confidence': numeric_ratio,
                'is_integer': all(item.replace('.', '').replace('-', '').isdigit() for item in clean_data)
            }
        elif boolean_ratio > 0.8:
            return {
                'type': 'boolean',
                'confidence': boolean_ratio
            }
        elif flora_matches > fauna_matches:
            return {
                'type': 'flora_related',
                'confidence': flora_matches / len(clean_data),
                'is_flora': True
            }
        elif fauna_matches > flora_matches:
            return {
                'type': 'fauna_related',
                'confidence': fauna_matches / len(clean_data),
                'is_fauna': True
            }
        else:
            return {
                'type': 'text',
                'confidence': 0.5,
                'is_flora': flora_matches > 0,
                'is_fauna': fauna_matches > 0
            }
    
    def create_intelligent_mapping(self, columns: List[str], sample_data: Dict[str, List[str]]) -> Dict[str, Any]:
        """Create intelligent column mapping using multiple strategies"""
        mapping = {
            "flora": {},
            "fauna": {},
            "articles": {},
            "confidence_scores": {},
            "mapping_strategy": "intelligent"
        }
        
        # Analyze each column
        for col in columns:
            col_lower = col.lower().strip()
            col_clean = col_lower.replace('_', '').replace('-', '').replace(' ', '')
            
            # Get sample data for this column
            sample_values = sample_data.get(col, [])[:10]  # Use first 10 values for analysis
            content_analysis = self.analyze_column_content(sample_values, col)
            
            # Try to map to flora schema
            for field, patterns in self.flora_schema.items():
                score, pattern = self.find_best_match(col, field, patterns)
                if score > 0.4:  # Lower threshold for better matching
                    # Check if this column is already mapped to a better field
                    already_mapped = False
                    for existing_field, existing_col in mapping["flora"].items():
                        if existing_col == col and mapping["confidence_scores"].get(f"{existing_field}_flora", 0) > score:
                            already_mapped = True
                            break
                    
                    if not already_mapped and (field not in mapping["flora"] or score > mapping["confidence_scores"].get(f"{field}_flora", 0)):
                        mapping["flora"][field] = col
                        mapping["confidence_scores"][f"{field}_flora"] = score
            
            # Try to map to fauna schema
            for field, patterns in self.fauna_schema.items():
                score, pattern = self.find_best_match(col, field, patterns)
                if score > 0.4:  # Lower threshold for better matching
                    # Check if this column is already mapped to a better field
                    already_mapped = False
                    for existing_field, existing_col in mapping["fauna"].items():
                        if existing_col == col and mapping["confidence_scores"].get(f"{existing_field}_fauna", 0) > score:
                            already_mapped = True
                            break
                    
                    if not already_mapped and (field not in mapping["fauna"] or score > mapping["confidence_scores"].get(f"{field}_fauna", 0)):
                        mapping["fauna"][field] = col
                        mapping["confidence_scores"][f"{field}_fauna"] = score
            
            # Try to map to articles schema
            for field, patterns in self.articles_schema.items():
                score, pattern = self.find_best_match(col, field, patterns)
                if score > 0.6:  # Threshold for fuzzy matching
                    # Check if this column is already mapped to a better field
                    already_mapped = False
                    for existing_field, existing_col in mapping["articles"].items():
                        if existing_col == col and mapping["confidence_scores"].get(f"{existing_field}_articles", 0) > score:
                            already_mapped = True
                            break
                    
                    if not already_mapped and (field not in mapping["articles"] or score > mapping["confidence_scores"].get(f"{field}_articles", 0)):
                        mapping["articles"][field] = col
                        mapping["confidence_scores"][f"{field}_articles"] = score
            
            # Use content analysis for additional mapping hints
            if content_analysis['type'] == 'scientific_name':
                if content_analysis.get('is_flora', False) and 'nama_ilmiah' not in mapping["flora"]:
                    mapping["flora"]["nama_ilmiah"] = col
                    mapping["confidence_scores"]["nama_ilmiah_flora"] = content_analysis['confidence']
                elif content_analysis.get('is_fauna', False) and 'nama_ilmiah' not in mapping["fauna"]:
                    mapping["fauna"]["nama_ilmiah"] = col
                    mapping["confidence_scores"]["nama_ilmiah_fauna"] = content_analysis['confidence']
        
        # Add type classification column if not found
        if 'tipe' not in [col.lower() for col in columns] and 'type' not in [col.lower() for col in columns]:
            # Look for the best column to use as type classifier
            type_candidates = []
            for col in columns:
                col_lower = col.lower()
                if any(keyword in col_lower for keyword in ['type', 'tipe', 'jenis', 'kategori', 'category', 'class', 'classification']):
                    type_candidates.append(col)
            
            if type_candidates:
                best_type_col = type_candidates[0]  # Use first candidate
                mapping["flora"]["tipe"] = best_type_col
                mapping["fauna"]["tipe"] = best_type_col
            else:
                # Use last column as fallback
                mapping["flora"]["tipe"] = columns[-1]
                mapping["fauna"]["tipe"] = columns[-1]
        
        return mapping
    
    async def create_ai_powered_mapping(self, columns: List[str], sample_data: Dict[str, List[str]], park_name: str) -> Dict[str, Any]:
        """Create AI-powered column mapping using Ollama with enhanced species classification"""
        try:
            # Prepare sample data for AI analysis
            sample_text = "Column Analysis:\n"
            for col in columns[:10]:  # Limit to first 10 columns
                sample_values = sample_data.get(col, [])[:5]  # First 5 values per column
                sample_text += f"- {col}: {', '.join(map(str, sample_values))}\n"
            
            # First, classify species types using AI
            species_classification = await self._classify_species_types(sample_data, park_name)
            
            prompt = f"""
You are an expert data analyst specializing in biodiversity data mapping for Indonesian conservation parks. 
Analyze the following CSV columns from a park called "{park_name}" and map them to the appropriate database schema.

CSV Columns and Sample Data:
{sample_text}

Species Classification Analysis:
{species_classification}

Database Schema Fields:
- Flora: nama_lokal, nama_ilmiah, famili, genus, status_iucn, is_endemic, habitat, deskripsi, morfologi, ekologi, manfaat, ancaman
- Fauna: nama_lokal, nama_ilmiah, famili, genus, status_iucn, is_endemic, habitat, deskripsi, morfologi, ekologi, manfaat, ancaman
- Articles: judul, konten, kategori, ringkasan

Please provide a JSON mapping in this exact format:
{{
    "flora": {{"field_name": "csv_column_name"}},
    "fauna": {{"field_name": "csv_column_name"}},
    "articles": {{"field_name": "csv_column_name"}},
    "confidence_scores": {{"field_name": 0.95}},
    "mapping_strategy": "ai_powered",
    "reasoning": "Brief explanation of mapping decisions",
    "species_classification": {{"flora_count": 0, "fauna_count": 0, "mixed": false}}
}}

Rules:
1. Map columns based on content analysis, not just column names
2. Use fuzzy matching for similar names (e.g., "Species Name" -> "nama_ilmiah")
3. Consider Indonesian and English column names
4. Provide confidence scores (0.0-1.0) for each mapping
5. If unsure, leave field unmapped rather than guessing
6. Focus on scientific accuracy for biodiversity data
7. Use the species classification to determine if data is flora, fauna, or mixed
8. Map conservation status to IUCN categories (LC, NT, VU, EN, CR, EW, EX)
9. Map endemic status to boolean (Yes/True/Endemic -> true, No/False/Non-endemic -> false)
"""
            
            response = await self.ollama_provider.generate_response(
                messages=[ChatTurn(role="user", content=prompt)],
                model="qwen2.5:latest"
            )
            
            # Parse AI response
            try:
                # Extract JSON from response
                json_start = response.find('{')
                json_end = response.rfind('}') + 1
                if json_start != -1 and json_end != -1:
                    json_str = response[json_start:json_end]
                    ai_mapping = json.loads(json_str)
                    
                    # Validate and clean the mapping
                    if "flora" in ai_mapping and "fauna" in ai_mapping:
                        return ai_mapping
            except (json.JSONDecodeError, KeyError) as e:
                print(f"AI mapping parsing failed: {e}")
                
        except Exception as e:
            print(f"AI-powered mapping failed: {e}")
        
        # Fallback to intelligent mapping
        return self.create_intelligent_mapping(columns, sample_data)
    
    async def _classify_species_types(self, sample_data: Dict[str, List[str]], park_name: str) -> str:
        """Classify species types using AI to determine if data contains flora, fauna, or both"""
        try:
            # Find columns that likely contain species names
            species_columns = []
            for col, values in sample_data.items():
                col_lower = col.lower()
                if any(keyword in col_lower for keyword in ['species', 'nama', 'name', 'spesies', 'binomial', 'scientific']):
                    species_columns.append((col, values))
            
            if not species_columns:
                return "No species columns detected"
            
            # Prepare species data for AI analysis
            species_text = ""
            for col, values in species_columns[:2]:  # Limit to first 2 species columns
                species_text += f"{col}: {', '.join(map(str, values[:10]))}\n"
            
            prompt = f"""
You are a biodiversity expert specializing in Indonesian flora and fauna classification.
Analyze the following species data from "{park_name}" park and classify each species as flora (plant) or fauna (animal).

Species Data:
{species_text}

Please provide a JSON analysis in this exact format:
{{
    "classification": [
        {{"species": "species_name", "type": "flora|fauna", "confidence": 0.95, "reasoning": "brief explanation"}}
    ],
    "summary": {{
        "flora_count": 0,
        "fauna_count": 0,
        "mixed_dataset": true/false,
        "primary_type": "flora|fauna|mixed"
    }}
}}

Rules:
1. Flora includes: plants, trees, flowers, orchids, ferns, mosses, algae, fungi
2. Fauna includes: mammals, birds, reptiles, amphibians, fish, insects, invertebrates
3. Use scientific names and common names to determine classification
4. Provide confidence scores (0.0-1.0) for each classification
5. Consider Indonesian species names and scientific binomial nomenclature
6. If uncertain, mark as lower confidence but still classify
"""
            
            response = await self.ollama_provider.generate_response(
                messages=[ChatTurn(role="user", content=prompt)],
                model="qwen2.5:latest"
            )
            
            # Parse AI response
            try:
                import json
                classification_result = json.loads(response)
                return json.dumps(classification_result, indent=2)
            except json.JSONDecodeError:
                return f"AI classification response (raw): {response[:200]}..."
                
        except Exception as e:
            return f"Species classification failed: {str(e)}"

class ComprehensiveAIService:
    def __init__(self):
        self.ollama_provider = OllamaProvider()
        self.data_processor = AdvancedDataProcessor()
        self.entity_resolver = EntityResolver()
        self.column_mapper = IntelligentColumnMapper()
    
    # ==================== ARTICLE & NEWS GENERATION ====================
    
    async def generate_article_content(self, article_data: Dict[str, Any]) -> Dict[str, str]:
        """
        Generate comprehensive article content including title, summary, and full content
        """
        prompt = self._build_article_prompt(article_data)
        
        messages: list[ChatTurn] = [
            {
                "role": "system", 
                "content": "Anda adalah jurnalis lingkungan dan konservasi Indonesia yang berpengalaman. Tugas Anda adalah membuat artikel yang informatif, menarik, dan mudah dipahami tentang keanekaragaman hayati Indonesia. Artikel harus dalam bahasa Indonesia yang baik dan benar."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
        
        content = await self.ollama_provider.generate(messages)
        
        # Extract title and summary from content
        title = self._extract_title_from_content(content)
        summary = self._extract_summary_from_content(content)
        
        return {
            "title": title,
            "summary": summary,
            "content": content
        }
    
    async def generate_news_content(self, news_data: Dict[str, Any]) -> Dict[str, str]:
        """
        Generate news content with headline, lead, and body
        """
        prompt = self._build_news_prompt(news_data)
        
        messages: list[ChatTurn] = [
            {
                "role": "system", 
                "content": "Anda adalah jurnalis berita lingkungan Indonesia yang berpengalaman. Buatkan berita yang akurat, objektif, dan menarik tentang keanekaragaman hayati Indonesia. Gunakan gaya penulisan berita yang profesional."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
        
        content = await self.ollama_provider.generate(messages)
        
        # Extract headline and lead from content
        headline = self._extract_headline_from_content(content)
        lead = self._extract_lead_from_content(content)
        
        return {
            "headline": headline,
            "lead": lead,
            "content": content
        }
    
    # ==================== CSV DATA EXTRACTION ====================
    
    async def extract_csv_data(self, csv_content: str, park_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract and validate data from CSV for park import with advanced data processing
        """
        try:
            if PANDAS_AVAILABLE:
                # Parse CSV content with pandas
                import io
                df = pd.read_csv(io.StringIO(csv_content))
                
                # Analyze CSV structure
                analysis = await self._analyze_csv_structure(df, park_info)
                
                # Extract flora data
                flora_data = await self._extract_flora_data(df, analysis)
                
                # Extract fauna data  
                fauna_data = await self._extract_fauna_data(df, analysis)
                
                # Extract articles/news data
                articles_data = await self._extract_articles_data(df, analysis)
                
                # Advanced data processing
                all_data = flora_data + fauna_data + articles_data
                processed_data = await self._process_extracted_data(all_data, analysis)
                
                # Separate processed data back to categories
                processed_flora = [item for item in processed_data if item.get('tipe', '').lower() in ['flora', 'plant']]
                processed_fauna = [item for item in processed_data if item.get('tipe', '').lower() in ['fauna', 'animal']]
                processed_articles = [item for item in processed_data if item.get('tipe', '').lower() in ['article', 'news']]
                
                # Calculate mapping confidence summary
                confidence_scores = analysis.get("confidence_scores", {})
                mapping_strategy = analysis.get("strategy", "unknown")
                reasoning = analysis.get("reasoning", "No reasoning provided")
                
                # Create mapping summary
                mapping_summary = {
                    "strategy_used": mapping_strategy,
                    "reasoning": reasoning,
                    "confidence_scores": confidence_scores,
                    "flora_mappings": len(analysis.get("mapping", {}).get("flora", {})),
                    "fauna_mappings": len(analysis.get("mapping", {}).get("fauna", {})),
                    "articles_mappings": len(analysis.get("mapping", {}).get("articles", {}))
                }
                
                return {
                    "success": True,
                    "message": f"Data CSV berhasil diekstrak: {len(processed_flora)} flora, {len(processed_fauna)} fauna, {len(processed_articles)} artikel dari {len(df)} record",
                    "analysis": analysis,
                    "mapping_summary": mapping_summary,
                    "flora_data": processed_flora,
                    "fauna_data": processed_fauna,
                    "articles_data": processed_articles,
                    "total_records": len(df),
                    "valid_records": len(processed_flora) + len(processed_fauna) + len(processed_articles),
                    "processing_stats": self._get_processing_stats(processed_data)
                }
            else:
                # Fallback to basic CSV parsing
                return await self._extract_csv_basic(csv_content, park_info)
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "analysis": None,
                "flora_data": [],
                "fauna_data": [],
                "articles_data": [],
                "total_records": 0,
                "valid_records": 0
            }
    
    async def _process_extracted_data(self, data: List[Dict[str, Any]], analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Apply advanced data processing to extracted data"""
        if not data:
            return data
        
        # Identify column types
        numeric_columns = []
        text_columns = []
        
        for col in analysis.get('columns', []):
            col_lower = col.lower()
            if any(pattern in col_lower for pattern in ['id', 'count', 'number', 'age', 'size', 'weight', 'height']):
                numeric_columns.append(col)
            elif any(pattern in col_lower for pattern in ['name', 'description', 'habitat', 'family', 'genus']):
                text_columns.append(col)
        
        # 1. Data Cleaning & Imputation
        data = self.data_processor.clean_text_data(data, text_columns)
        data = self.data_processor.impute_missing_values(data, numeric_columns)
        
        # 2. Outlier Detection
        outliers = self.data_processor.detect_outliers(data, numeric_columns)
        
        # 3. Data Type Validation
        schema = {
            'nama_lokal': 'str',
            'nama_ilmiah': 'str', 
            'famili': 'str',
            'genus': 'str',
            'status_iucn': 'str',
            'is_endemic': 'bool',
            'habitat': 'str',
            'deskripsi': 'str'
        }
        data = self.data_processor.validate_data_types(data, schema)
        
        # 4. Entity Resolution & Enrichment
        processed_data = []
        for item in data:
            # Resolve entity
            scientific_name = item.get('nama_ilmiah', '')
            common_name = item.get('nama_lokal', '')
            entity_info = self.entity_resolver.resolve_entity(scientific_name, common_name)
            
            # Enrich data
            enriched_item = self.entity_resolver.enrich_data(item)
            enriched_item.update(entity_info)
            
            # Validate entity
            validated_item = self.entity_resolver.validate_entity(enriched_item)
            
            processed_data.append(validated_item)
        
        return processed_data
    
    def _get_processing_stats(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Get statistics about data processing"""
        stats = {
            "total_processed": len(data),
            "resolved_entities": sum(1 for item in data if item.get('resolved', False)),
            "valid_entities": sum(1 for item in data if item.get('validation', {}).get('is_valid', False)),
            "outliers_detected": 0,
            "missing_values_imputed": 0,
            "data_types_converted": 0
        }
        
        # Count outliers
        for item in data:
            if 'outlier_flags' in item:
                stats["outliers_detected"] += sum(1 for flag in item['outlier_flags'].values() if flag)
        
        # Count imputed values
        for item in data:
            if 'imputed_fields' in item:
                stats["missing_values_imputed"] += len(item['imputed_fields'])
        
        # Count type conversions
        for item in data:
            if 'type_conversions' in item:
                stats["data_types_converted"] += len(item['type_conversions'])
        
        return stats
    
    async def _analyze_csv_structure(self, df: DataFrame, park_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze CSV structure to identify columns and data types using intelligent mapping
        """
        columns = df.columns.tolist()
        park_name = park_info.get('name', 'Unknown Park')
        
        # Prepare sample data for analysis
        sample_data = {}
        for col in columns:
            if PANDAS_AVAILABLE:
                sample_data[col] = df[col].head(10).dropna().tolist()
            else:
                sample_data[col] = [str(row[col]) for i, row in df.iterrows() if i < 10 and row[col] is not None]
        
        # Try AI-powered mapping first
        try:
            ai_mapping = await self.column_mapper.create_ai_powered_mapping(columns, sample_data, park_name)
            if ai_mapping.get("mapping_strategy") == "ai_powered":
                return {
                    "columns": columns,
                    "mapping": {
                        "flora": ai_mapping.get("flora", {}),
                        "fauna": ai_mapping.get("fauna", {}),
                        "articles": ai_mapping.get("articles", {})
                    },
                    "confidence_scores": ai_mapping.get("confidence_scores", {}),
                    "strategy": "ai_powered",
                    "reasoning": ai_mapping.get("reasoning", "AI-powered analysis")
                }
        except Exception as e:
            print(f"AI-powered mapping failed: {e}")
        
        # Fallback to intelligent mapping
        try:
            intelligent_mapping = self.column_mapper.create_intelligent_mapping(columns, sample_data)
            return {
                "columns": columns,
                "mapping": {
                    "flora": intelligent_mapping.get("flora", {}),
                    "fauna": intelligent_mapping.get("fauna", {}),
                    "articles": intelligent_mapping.get("articles", {})
                },
                "confidence_scores": intelligent_mapping.get("confidence_scores", {}),
                "strategy": "intelligent",
                "reasoning": "Intelligent fuzzy matching and content analysis"
            }
        except Exception as e:
            print(f"Intelligent mapping failed: {e}")
        
        # Final fallback to rule-based mapping
        fallback_mapping = self._create_fallback_mapping(columns)
        return {
            "columns": columns,
            "mapping": {
                "flora": fallback_mapping.get("flora", {}),
                "fauna": fallback_mapping.get("fauna", {}),
                "articles": fallback_mapping.get("articles", {})
            },
            "strategy": "fallback",
            "reasoning": "Basic rule-based mapping",
            "total_rows": len(df)
        }
    
    async def _extract_flora_data(self, df: DataFrame, analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extract flora data from CSV based on analysis
        """
        flora_data = []
        mapping = analysis.get('mapping', {}).get('flora', {})
        
        for index, row in df.iterrows():
            try:
                flora_record = {}
                
                # Map columns to flora fields
                for flora_field, csv_col in mapping.items():
                    if csv_col in df.columns and (PANDAS_AVAILABLE and pd.notna(row[csv_col]) or not PANDAS_AVAILABLE and row[csv_col] is not None):
                        flora_record[flora_field] = str(row[csv_col]).strip()
                
                # Validate required fields and check type - more flexible validation
                has_name = flora_record.get('local_name') or flora_record.get('scientific_name')
                record_type = flora_record.get('tipe', '').lower()
                scientific_name = flora_record.get('scientific_name', '').lower()
                
                # Check if this is actually flora based on scientific name
                if has_name and scientific_name in ['plantae', 'fungi']:
                    flora_data.append(flora_record)
                    
            except Exception as e:
                continue  # Skip invalid records
        
        return flora_data
    
    async def _extract_fauna_data(self, df: DataFrame, analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extract fauna data from CSV based on analysis
        """
        fauna_data = []
        mapping = analysis.get('mapping', {}).get('fauna', {})
        
        for index, row in df.iterrows():
            try:
                fauna_record = {}
                
                # Map columns to fauna fields
                for fauna_field, csv_col in mapping.items():
                    if csv_col in df.columns and (PANDAS_AVAILABLE and pd.notna(row[csv_col]) or not PANDAS_AVAILABLE and row[csv_col] is not None):
                        fauna_record[fauna_field] = str(row[csv_col]).strip()
                
                # Validate required fields and check type - more flexible validation
                has_name = fauna_record.get('local_name') or fauna_record.get('scientific_name')
                record_type = fauna_record.get('tipe', '').lower()
                scientific_name = fauna_record.get('scientific_name', '').lower()
                
                # Check if this is actually fauna based on scientific name (exclude flora categories)
                if has_name and scientific_name in ['animalia', 'mammalia', 'aves', 'reptilia', 'amphibia', 'insecta', 'arachnida', 'mollusca']:
                    fauna_data.append(fauna_record)
                    
            except Exception as e:
                continue  # Skip invalid records
        
        return fauna_data
    
    async def _extract_articles_data(self, df: DataFrame, analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extract articles data from CSV based on analysis
        """
        articles_data = []
        mapping = analysis.get('mapping', {}).get('articles', {})
        
        for index, row in df.iterrows():
            try:
                article_record = {}
                
                # Map columns to article fields
                for article_field, csv_col in mapping.items():
                    if csv_col in df.columns and (PANDAS_AVAILABLE and pd.notna(row[csv_col]) or not PANDAS_AVAILABLE and row[csv_col] is not None):
                        article_record[article_field] = str(row[csv_col]).strip()
                
                # Validate required fields
                if article_record.get('judul') or article_record.get('konten'):
                    articles_data.append(article_record)
                    
            except Exception as e:
                continue  # Skip invalid records
        
        return articles_data
    
    # ==================== PROMPT BUILDERS ====================
    
    def _build_article_prompt(self, article_data: Dict[str, Any]) -> str:
        """Build prompt for article generation"""
        
        topic = article_data.get('topic', '')
        category = article_data.get('category', 'Konservasi')
        park_name = article_data.get('park_name', '')
        key_points = article_data.get('key_points', [])
        
        prompt_parts = [
            "Buatkan artikel lengkap tentang keanekaragaman hayati Indonesia dengan spesifikasi berikut:",
            "",
            f"Topik: {topic}" if topic else "Topik: [Tidak ditentukan]",
            f"Kategori: {category}",
            f"Taman: {park_name}" if park_name else "Taman: [Tidak ditentukan]",
            "",
            "Poin-poin penting yang harus disertakan:"
        ]
        
        if key_points:
            for i, point in enumerate(key_points, 1):
                prompt_parts.append(f"{i}. {point}")
        else:
            prompt_parts.append("- [Tidak ada poin khusus]")
        
        prompt_parts.extend([
            "",
            "Artikel harus mencakup:",
            "1. Judul yang menarik dan informatif",
            "2. Ringkasan/abstrak (2-3 paragraf)",
            "3. Konten utama yang informatif dan mudah dipahami",
            "4. Penutup yang mengajak pembaca untuk peduli konservasi",
            "",
            "Gunakan bahasa Indonesia yang baik dan benar. Panjang artikel minimal 500 kata.",
            "Fokus pada aspek konservasi, keanekaragaman hayati, dan pentingnya pelestarian alam Indonesia."
        ])
        
        return "\n".join(prompt_parts)
    
    def _build_news_prompt(self, news_data: Dict[str, Any]) -> str:
        """Build prompt for news generation"""
        
        event = news_data.get('event', '')
        location = news_data.get('location', '')
        park_name = news_data.get('park_name', '')
        impact = news_data.get('impact', '')
        
        prompt_parts = [
            "Buatkan berita tentang keanekaragaman hayati Indonesia dengan spesifikasi berikut:",
            "",
            f"Peristiwa: {event}" if event else "Peristiwa: [Tidak ditentukan]",
            f"Lokasi: {location}" if location else "Lokasi: [Tidak ditentukan]",
            f"Taman: {park_name}" if park_name else "Taman: [Tidak ditentukan]",
            f"Dampak: {impact}" if impact else "Dampak: [Tidak ditentukan]",
            "",
            "Berita harus mencakup:",
            "1. Headline yang menarik dan informatif",
            "2. Lead/teras berita yang ringkas (1-2 paragraf)",
            "3. Body berita yang detail dan objektif",
            "4. Konteks dan latar belakang",
            "5. Dampak dan implikasi",
            "",
            "Gunakan gaya penulisan berita yang profesional. Panjang berita minimal 300 kata.",
            "Fokus pada fakta, dampak, dan relevansi dengan konservasi keanekaragaman hayati Indonesia."
        ]
        
        return "\n".join(prompt_parts)
    
    # ==================== UTILITY METHODS ====================
    
    def _extract_title_from_content(self, content: str) -> str:
        """Extract title from generated content"""
        lines = content.split('\n')
        for line in lines:
            if line.strip() and not line.startswith(' '):
                return line.strip()
        return "Artikel Keanekaragaman Hayati"
    
    def _extract_summary_from_content(self, content: str) -> str:
        """Extract summary from generated content"""
        paragraphs = content.split('\n\n')
        if len(paragraphs) > 1:
            return paragraphs[1][:300] + "..." if len(paragraphs[1]) > 300 else paragraphs[1]
        return content[:300] + "..." if len(content) > 300 else content
    
    def _extract_headline_from_content(self, content: str) -> str:
        """Extract headline from generated content"""
        lines = content.split('\n')
        for line in lines:
            if line.strip() and not line.startswith(' '):
                return line.strip()
        return "Berita Keanekaragaman Hayati"
    
    def _extract_lead_from_content(self, content: str) -> str:
        """Extract lead from generated content"""
        paragraphs = content.split('\n\n')
        if len(paragraphs) > 1:
            return paragraphs[1][:200] + "..." if len(paragraphs[1]) > 200 else paragraphs[1]
        return content[:200] + "..." if len(content) > 200 else content
    
    def _create_fallback_mapping(self, columns: List[str]) -> Dict[str, Any]:
        """Create fallback mapping when AI analysis fails"""
        mapping = {
            "flora": {},
            "fauna": {},
            "articles": {}
        }
        
        # Enhanced column mapping with more patterns and fuzzy matching
        for col in columns:
            col_lower = col.lower().strip()
            col_clean = col_lower.replace('_', '').replace('-', '').replace(' ', '')
            
            # Common mappings for both flora and fauna
            if any(pattern in col_lower for pattern in ['nama_lokal', 'local', 'nama_umum', 'common', 'indonesia', 'indonesian', 'species name', 'species_name']):
                mapping["flora"]["nama_lokal"] = col
                mapping["fauna"]["nama_lokal"] = col
            elif col_lower == 'species identified':
                mapping["flora"]["nama_ilmiah"] = col
                mapping["fauna"]["nama_ilmiah"] = col
            elif col_lower == 'label':
                mapping["flora"]["nama_ilmiah"] = col
                mapping["fauna"]["nama_ilmiah"] = col
            elif any(pattern in col_lower for pattern in ['nama_ilmiah', 'scientific', 'latin', 'binomial', 'species', 'scientific name', 'scientific_name']) and col_lower != 'category of species':
                mapping["flora"]["nama_ilmiah"] = col
                mapping["fauna"]["nama_ilmiah"] = col
            elif any(pattern in col_lower for pattern in ['famili', 'family', 'familia']):
                mapping["flora"]["famili"] = col
                mapping["fauna"]["famili"] = col
            elif any(pattern in col_lower for pattern in ['genus', 'gen']):
                mapping["flora"]["genus"] = col
                mapping["fauna"]["genus"] = col
            elif any(pattern in col_lower for pattern in ['status_iucn', 'iucn', 'status', 'conservation', 'red_list', 'conservation status', 'conservation_status']):
                mapping["flora"]["status_iucn"] = col
                mapping["fauna"]["status_iucn"] = col
            elif any(pattern in col_lower for pattern in ['is_endemic', 'endemic', 'endemik', 'endemism']):
                mapping["flora"]["is_endemic"] = col
                mapping["fauna"]["is_endemic"] = col
            elif any(pattern in col_lower for pattern in ['habitat', 'tempat', 'lingkungan', 'environment']):
                mapping["flora"]["habitat"] = col
                mapping["fauna"]["habitat"] = col
            elif col_lower == 'category of species':
                mapping["flora"]["tipe"] = col
                mapping["fauna"]["tipe"] = col
            elif col_lower == 'type':
                mapping["flora"]["tipe"] = col
                mapping["fauna"]["tipe"] = col
            elif any(pattern in col_lower for pattern in ['deskripsi', 'description', 'keterangan', 'info', 'detail']):
                mapping["flora"]["deskripsi"] = col
                mapping["fauna"]["deskripsi"] = col
            
            # Article mappings
            elif any(pattern in col_lower for pattern in ['judul', 'title', 'headline', 'nama_artikel']):
                mapping["articles"]["judul"] = col
            elif any(pattern in col_lower for pattern in ['konten', 'content', 'isi', 'body', 'text']):
                mapping["articles"]["konten"] = col
            elif any(pattern in col_lower for pattern in ['kategori', 'category', 'type', 'jenis_artikel']):
                mapping["articles"]["kategori"] = col
        
        # If no specific mappings found, try to map by position (first few columns)
        if not any(mapping["flora"].values()) and not any(mapping["fauna"].values()):
            for i, col in enumerate(columns[:10]):  # Only check first 10 columns
                if i == 0:  # First column might be name
                    mapping["flora"]["nama_lokal"] = col
                    mapping["fauna"]["nama_lokal"] = col
                elif i == 1:  # Second column might be scientific name
                    mapping["flora"]["nama_ilmiah"] = col
                    mapping["fauna"]["nama_ilmiah"] = col
                elif i == 2:  # Third column might be family
                    mapping["flora"]["famili"] = col
                    mapping["fauna"]["famili"] = col
                elif i == 3:  # Fourth column might be genus
                    mapping["flora"]["genus"] = col
                    mapping["fauna"]["genus"] = col
        
        # Add a generic 'tipe' column if none exists - will be filled during processing
        if 'tipe' not in [col.lower() for col in columns] and 'type' not in [col.lower() for col in columns]:
            # Look for type-like columns
            type_columns = [col for col in columns if any(pattern in col.lower() for pattern in ['type', 'tipe', 'jenis', 'kategori', 'category'])]
            if type_columns:
                mapping["flora"]["tipe"] = type_columns[0]
                mapping["fauna"]["tipe"] = type_columns[0]
            elif columns:
                mapping["flora"]["tipe"] = columns[-1]  # Use last column as type
                mapping["fauna"]["tipe"] = columns[-1]
        
        return mapping
    
    def _is_likely_flora(self, scientific_name: str) -> bool:
        """Detect if scientific name is likely flora based on common patterns"""
        if not scientific_name:
            return False
        
        # Common flora genus patterns
        flora_patterns = [
            'aceae',  # Family suffix
            'aceae',  # Family suffix
            'phyllum', 'phyllus',  # Leaf-related
            'flora', 'florus',  # Flower-related
            'folia', 'folius',  # Leaf-related
            'arbor', 'arborea',  # Tree-related
            'herba', 'herbacea',  # Herb-related
            'vitis',  # Grape family
            'rosa',  # Rose family
            'pinus',  # Pine
            'quercus',  # Oak
            'eucalyptus',  # Eucalyptus
            'ficus',  # Fig
            'mangifera',  # Mango
            'citrus',  # Citrus
            'musa',  # Banana
            'zea',  # Corn
            'oryza',  # Rice
            'triticum',  # Wheat
            'solanum',  # Tomato/potato family
            'capsicum',  # Pepper
            'lycopersicon',  # Tomato
            'cucumis',  # Cucumber
            'brassica',  # Cabbage family
            'allium',  # Onion family
            'daucus',  # Carrot
            'apium',  # Celery
            'petroselinum',  # Parsley
            'coriandrum',  # Coriander
            'mentha',  # Mint
            'ocimum',  # Basil
            'thymus',  # Thyme
            'lavandula',  # Lavender
            'salvia',  # Sage
            'rosmarinus',  # Rosemary
            'origanum',  # Oregano
            'cinnamomum',  # Cinnamon
            'syzygium',  # Clove
            'piper',  # Pepper
            'zingiber',  # Ginger
            'curcuma',  # Turmeric
            'alpinia',  # Galangal
            'cocos',  # Coconut
            'elaeis',  # Oil palm
            'areca',  # Betel nut
            'pandanus',  # Pandan
            'nymphaea',  # Water lily
            'lotus',  # Lotus
            'nelumbo',  # Sacred lotus
            'phalaenopsis',  # Orchid
            'dendrobium',  # Orchid
            'cattleya',  # Orchid
            'vanda',  # Orchid
            'oncidium',  # Orchid
            'cymbidium',  # Orchid
            'paphiopedilum',  # Slipper orchid
            'bulbophyllum',  # Orchid
            'aerides',  # Orchid
            'renanthera',  # Orchid
            'coelogyne',  # Orchid
            'grammatophyllum',  # Orchid
            'maxillaria',  # Orchid
            'pleurothallis',  # Orchid
            'masdevallia',  # Orchid
            'dracula',  # Orchid
            'miltonia',  # Orchid
            'odontoglossum',  # Orchid
            'brassia',  # Spider orchid
            'epidendrum',  # Orchid
            'encyclia',  # Orchid
            'prosthechea',  # Orchid
            'psychopsis',  # Butterfly orchid
            'stanhopea',  # Orchid
            'gongora',  # Orchid
            'catasetum',  # Orchid
            'cycnoches',  # Swan orchid
            'mormodes',  # Goblin orchid
            'lycaste',  # Orchid
            'anguloa',  # Tulip orchid
            'bifrenaria',  # Orchid
            'sophronitis',  # Orchid
            'laelia',  # Orchid
            'schomburgkia',  # Orchid
            'myrmecophila',  # Ant orchid
            'epicattleya',  # Orchid hybrid
            'brassolaeliocattleya',  # Orchid hybrid
            'sophrocattleya',  # Orchid hybrid
            'rhyncholaelia',  # Orchid
            'barkeria',  # Orchid
            'isabella',  # Orchid
            'isabella',  # Orchid
            'isabella',  # Orchid
        ]
        
        scientific_lower = scientific_name.lower()
        return any(pattern in scientific_lower for pattern in flora_patterns)
    
    def _is_likely_fauna(self, scientific_name: str) -> bool:
        """Detect if scientific name is likely fauna based on common patterns"""
        if not scientific_name:
            return False
        
        # Common fauna genus patterns
        fauna_patterns = [
            'idae',  # Family suffix
            'formes',  # Order suffix
            'panthera',  # Big cats
            'felis',  # Small cats
            'canis',  # Dogs
            'vulpes',  # Foxes
            'ursus',  # Bears
            'elephas',  # Elephants
            'loxodonta',  # African elephants
            'equus',  # Horses
            'bos',  # Cattle
            'bubalus',  # Water buffalo
            'capra',  # Goats
            'ovis',  # Sheep
            'sus',  # Pigs
            'cervus',  # Deer
            'muntiacus',  # Muntjac
            'tragulus',  # Mouse deer
            'tapirus',  # Tapirs
            'rhinoceros',  # Rhinos
            'diceros',  # Black rhino
            'ceratotherium',  # White rhino
            'hippopotamus',  # Hippos
            'giraffa',  # Giraffes
            'okapia',  # Okapi
            'camelus',  # Camels
            'vicugna',  # Vicuña
            'lama',  # Llamas
            'alpaca',  # Alpacas
            'cervus',  # Deer
            'muntiacus',  # Muntjac
            'tragulus',  # Mouse deer
            'tapirus',  # Tapirs
            'rhinoceros',  # Rhinos
            'diceros',  # Black rhino
            'ceratotherium',  # White rhino
            'hippopotamus',  # Hippos
            'giraffa',  # Giraffes
            'okapia',  # Okapi
            'camelus',  # Camels
            'vicugna',  # Vicuña
            'lama',  # Llamas
            'alpaca',  # Alpacas
            'pongo',  # Orangutans
            'pan',  # Chimpanzees
            'gorilla',  # Gorillas
            'homo',  # Humans
            'australopithecus',  # Australopithecus
            'paranthropus',  # Paranthropus
            'sahelanthropus',  # Sahelanthropus
            'ardipithecus',  # Ardipithecus
            'kenyanthropus',  # Kenyanthropus
            'homo',  # Humans
            'australopithecus',  # Australopithecus
            'paranthropus',  # Paranthropus
            'sahelanthropus',  # Sahelanthropus
            'ardipithecus',  # Ardipithecus
            'kenyanthropus',  # Kenyanthropus
            'macaca',  # Macaques
            'presbytis',  # Langurs
            'trachypithecus',  # Langurs
            'semnopithecus',  # Langurs
            'pygathrix',  # Doucs
            'rhinopithecus',  # Snub-nosed monkeys
            'nasalis',  # Proboscis monkey
            'simias',  # Simakobu
            'hylobates',  # Gibbons
            'symphalangus',  # Siamangs
            'nomascus',  # Gibbons
            'bunopithecus',  # Gibbons
            'hoolock',  # Hoolock gibbons
            'pongo',  # Orangutans
            'pan',  # Chimpanzees
            'gorilla',  # Gorillas
            'homo',  # Humans
            'australopithecus',  # Australopithecus
            'paranthropus',  # Paranthropus
            'sahelanthropus',  # Sahelanthropus
            'ardipithecus',  # Ardipithecus
            'kenyanthropus',  # Kenyanthropus
            'macaca',  # Macaques
            'presbytis',  # Langurs
            'trachypithecus',  # Langurs
            'semnopithecus',  # Langurs
            'pygathrix',  # Doucs
            'rhinopithecus',  # Snub-nosed monkeys
            'nasalis',  # Proboscis monkey
            'simias',  # Simakobu
            'hylobates',  # Gibbons
            'symphalangus',  # Siamangs
            'nomascus',  # Gibbons
            'bunopithecus',  # Gibbons
            'hoolock',  # Hoolock gibbons
        ]
        
        scientific_lower = scientific_name.lower()
        return any(pattern in scientific_lower for pattern in fauna_patterns)
    
    async def _extract_csv_basic(self, csv_content: str, park_info: Dict[str, Any]) -> Dict[str, Any]:
        """
        Basic CSV extraction without pandas dependency
        """
        try:
            # Parse CSV content
            csv_reader = csv.DictReader(io.StringIO(csv_content))
            rows = list(csv_reader)
            
            if not rows:
                return {
                    "success": False,
                    "error": "CSV file is empty",
                    "analysis": None,
                    "flora_data": [],
                    "fauna_data": [],
                    "articles_data": [],
                    "total_records": 0,
                    "valid_records": 0
                }
            
            # Basic column mapping
            columns = list(rows[0].keys())
            mapping = self._create_fallback_mapping(columns)
            
            # Extract data
            flora_data = []
            fauna_data = []
            articles_data = []
            
            for row in rows:
                # Extract flora data
                flora_record = {}
                for flora_field, csv_col in mapping.get('flora', {}).items():
                    if csv_col in row and row[csv_col]:
                        flora_record[flora_field] = row[csv_col].strip()
                
                # Validate flora data
                has_name = flora_record.get('nama_lokal') or flora_record.get('nama_ilmiah')
                record_type = flora_record.get('tipe', '').lower()
                is_not_fauna = record_type not in ['fauna', 'animal', 'hewan']
                
                if has_name and is_not_fauna:
                    flora_data.append(flora_record)
                elif has_name and not flora_record.get('tipe'):
                    # Default to flora if no type specified
                    flora_record['tipe'] = 'flora'
                    flora_data.append(flora_record)
                
                # Extract fauna data
                fauna_record = {}
                for fauna_field, csv_col in mapping.get('fauna', {}).items():
                    if csv_col in row and row[csv_col]:
                        fauna_record[fauna_field] = row[csv_col].strip()
                
                # Validate fauna data
                has_name = fauna_record.get('nama_lokal') or fauna_record.get('nama_ilmiah')
                record_type = fauna_record.get('tipe', '').lower()
                is_not_flora = record_type not in ['flora', 'plant', 'tumbuhan']
                
                if has_name and is_not_flora:
                    fauna_data.append(fauna_record)
                elif has_name and not fauna_record.get('tipe'):
                    # Default to fauna if no type specified
                    fauna_record['tipe'] = 'fauna'
                    fauna_data.append(fauna_record)
                
                # Extract articles data
                article_record = {}
                for article_field, csv_col in mapping.get('articles', {}).items():
                    if csv_col in row and row[csv_col]:
                        article_record[article_field] = row[csv_col].strip()
                
                if article_record.get('judul') or article_record.get('konten'):
                    articles_data.append(article_record)
            
            return {
                "success": True,
                "analysis": {
                    "columns": columns,
                    "mapping": mapping,
                    "total_rows": len(rows)
                },
                "flora_data": flora_data,
                "fauna_data": fauna_data,
                "articles_data": articles_data,
                "total_records": len(rows),
                "valid_records": len(flora_data) + len(fauna_data) + len(articles_data)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "analysis": None,
                "flora_data": [],
                "fauna_data": [],
                "articles_data": [],
                "total_records": 0,
                "valid_records": 0
            }
