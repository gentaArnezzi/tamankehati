# Chatbot Constants Refactoring

## Overview

Refactored hardcoded error messages in chatbot services to use centralized constants for better maintainability and consistency.

## Changes Made

### 1. Created Constants File

**File**: `apps/backend/api/v1/public/constants.py`

Centralized all chatbot-related messages including:
- Error messages
- Rate limiting messages
- Validation messages
- AI provider messages
- Database error messages
- General messages

### 2. Updated Files

#### a. `services/main.py`
- ✅ Imported constants: `CHATBOT_ERROR_GENERAL`, `CHATBOT_NO_DATA_RESPONSE`, `AI_PROVIDER_ERROR`
- ✅ Replaced hardcoded error message in line 350 (general chatbot error)
- ✅ Replaced hardcoded error message in line 508 (AI generation error)
- ✅ Replaced hardcoded no-data response in line 516

#### b. `chatbot.py`
- ✅ Imported constants: `CHATBOT_ERROR_GENERAL`, `RATE_LIMIT_EXCEEDED`, `INVALID_MESSAGE_EMPTY`
- ✅ Replaced hardcoded rate limit message in line 75
- ✅ Replaced hardcoded empty message validation in line 89
- ✅ Replaced hardcoded general error in line 96

#### c. `services.py`
- ✅ Imported constant: `CHATBOT_ERROR_WITH_CONTACT`
- ✅ Replaced hardcoded error message in line 225

## Benefits

### 1. **Maintainability**
- All messages in one place
- Easy to update across entire application
- No need to search through multiple files

### 2. **Consistency**
- Ensures uniform messaging across all endpoints
- Prevents typos or variations in error messages

### 3. **Internationalization Ready**
- Easy to implement multi-language support
- Can swap constants based on user language

### 4. **Testing**
- Easier to test error messages
- Can mock constants for testing

### 5. **Documentation**
- Clear definition of all possible messages
- Self-documenting code

## Available Constants

### Error Messages
```python
CHATBOT_ERROR_GENERAL
CHATBOT_ERROR_WITH_CONTACT
AI_PROVIDER_ERROR
AI_PROVIDER_TIMEOUT
AI_PROVIDER_QUOTA_EXCEEDED
DB_ERROR_CONNECTION
DB_ERROR_QUERY
SERVER_ERROR
```

### Response Messages
```python
CHATBOT_NO_DATA_RESPONSE
CHATBOT_GREETING
```

### Validation Messages
```python
INVALID_MESSAGE_LENGTH
INVALID_MESSAGE_EMPTY
INVALID_MESSAGE_FORMAT
```

### Rate Limiting
```python
RATE_LIMIT_EXCEEDED
RATE_LIMIT_WARNING
```

## Usage Example

### Before (Hardcoded):
```python
except Exception as e:
    return "Maaf, terjadi kesalahan dalam memproses pertanyaan Anda. Silakan coba lagi nanti."
```

### After (Using Constants):
```python
from .constants import CHATBOT_ERROR_GENERAL

except Exception as e:
    return CHATBOT_ERROR_GENERAL
```

## Future Improvements

1. **Add Internationalization**
   ```python
   # constants_id.py (Indonesian)
   CHATBOT_ERROR_GENERAL = "Maaf, terjadi kesalahan..."
   
   # constants_en.py (English)
   CHATBOT_ERROR_GENERAL = "Sorry, an error occurred..."
   ```

2. **Add Logging Integration**
   ```python
   def get_error_message(error_code: str, log_details: dict = None):
       if log_details:
           logger.error(f"{error_code}: {log_details}")
       return CONSTANTS[error_code]
   ```

3. **Add Dynamic Variables**
   ```python
   RATE_LIMIT_EXCEEDED = "Terlalu banyak permintaan. Silakan tunggu {seconds} detik."
   
   def format_message(template: str, **kwargs) -> str:
       return template.format(**kwargs)
   ```

4. **Add HTTP Status Code Mapping**
   ```python
   ERROR_RESPONSES = {
       "CHATBOT_ERROR_GENERAL": {
           "status_code": 500,
           "message": CHATBOT_ERROR_GENERAL
       },
       "RATE_LIMIT_EXCEEDED": {
           "status_code": 429,
           "message": RATE_LIMIT_EXCEEDED
       }
   }
   ```

## Testing

All changes have been verified:
- ✅ No linter errors
- ✅ Import statements correct
- ✅ Constants properly referenced
- ✅ No hardcoded messages remaining

## Migration Notes

For developers:
1. Always use constants from `api/v1/public/constants.py`
2. Never hardcode user-facing messages
3. Add new constants to the constants file when needed
4. Document any new constants added

## File Structure

```
apps/backend/api/v1/public/
├── constants.py                    # ← New: All constants here
├── chatbot.py                      # Updated to use constants
├── services.py                     # Updated to use constants
└── services/
    └── main.py                     # Updated to use constants
```

## Conclusion

This refactoring improves code quality, maintainability, and consistency across the chatbot system. All hardcoded messages have been successfully moved to a centralized constants file.

---

**Date**: October 30, 2025  
**Author**: System Refactoring  
**Version**: 1.0

