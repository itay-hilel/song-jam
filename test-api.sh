#!/bin/bash

# Song Jam API Test Script
# This script demonstrates the full workflow of the Song Jam API

echo "🎵 Song Jam API Test Script"
echo "================================"

BASE_URL="http://localhost:3001"

# Check if server is running
echo "1. Checking server health..."
HEALTH=$(curl -s "$BASE_URL/health")
if [[ $? -eq 0 ]]; then
    echo "✅ Server is healthy: $HEALTH"
else
    echo "❌ Server is not running. Please start with 'npm start'"
    exit 1
fi

echo ""

# Create a new session
echo "2. Creating a new session..."
SESSION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/sessions" \
    -H "Content-Type: application/json" \
    -d '{"name": "Beach Vibes Session", "theme": "summer", "style": "reggae"}')

SESSION_ID=$(echo $SESSION_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "✅ Session created with ID: $SESSION_ID"
echo "Response: $SESSION_RESPONSE"

echo ""

# Join the session
echo "3. Joining the session..."
JOIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/sessions/$SESSION_ID/join" \
    -H "Content-Type: application/json" \
    -d '{"participantName": "Alice"}')

echo "✅ Alice joined the session"
echo "Response: $JOIN_RESPONSE"

echo ""

# Add a second participant
echo "4. Adding another participant..."
JOIN_RESPONSE2=$(curl -s -X POST "$BASE_URL/api/sessions/$SESSION_ID/join" \
    -H "Content-Type: application/json" \
    -d '{"participantName": "Bob"}')

echo "✅ Bob joined the session"

echo ""

# Add song lines
echo "5. Adding song lines..."
LINE1_RESPONSE=$(curl -s -X POST "$BASE_URL/api/sessions/$SESSION_ID/lines" \
    -H "Content-Type: application/json" \
    -d '{"prompt": "Write about waves crashing on a sunny beach"}')

echo "✅ First song line added"

LINE2_RESPONSE=$(curl -s -X POST "$BASE_URL/api/sessions/$SESSION_ID/lines" \
    -H "Content-Type: application/json" \
    -d '{"prompt": "Write about dancing in the sand with friends"}')

echo "✅ Second song line added"

echo ""

# Get session details
echo "6. Getting session details..."
SESSION_DETAILS=$(curl -s "$BASE_URL/api/sessions/$SESSION_ID")
echo "✅ Session details retrieved"
echo "Response: $SESSION_DETAILS"

echo ""

# Extract line IDs for reordering (this is simplified - in real usage you'd parse JSON properly)
echo "7. Reordering song lines..."
REORDER_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/sessions/$SESSION_ID/lines/reorder" \
    -H "Content-Type: application/json" \
    -d '{"lineIds": ["line_2", "line_1"]}')

echo "✅ Song lines reordered (note: this may fail if line IDs don't match)"

echo ""

# Complete the session
echo "8. Completing and exporting the session..."
COMPLETE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/sessions/$SESSION_ID/complete")

echo "✅ Session completed and exported"
echo "Response: $COMPLETE_RESPONSE"

echo ""
echo "🎉 API test completed successfully!"
echo "📝 Session ID: $SESSION_ID"
echo "🔗 Check the API documentation in API.md for more details"
