Problem Summary
Initial Issue
You were getting the error "Phone must be +65 followed by 8 digits" when trying to verify the OTP, even though you entered the phone number correctly.
Root Cause
The phone number wasn't being passed correctly from the phone input screen to the OTP verification screen. When checking the Network tab, we discovered the form was submitting phone: +65 (missing the 8 digits).
Why It Happened
Timing Issue: The PhoneLoginForm component was trying to read the phone number from the DOM input field (document.getElementById("phoneDigits")) AFTER the form was submitted.
DOM State: By the time the server responded with success and triggered the useEffect, the input field was either cleared or inaccessible, so it only captured an empty string.
String Concatenation: When we tried to build +65${input.value}, we got just +65 + "" = +65.
The Solution
We changed the approach to capture the phone number in real-time as the user types:
Added a React ref (phoneNumberRef) to store the phone number value
Updated the onChange handler to store the complete phone number (+6512345678) in the ref every time the user types
Used the ref value in the useEffect instead of trying to read from the DOM
This way, when the OTP is sent successfully, we have the complete, correctly formatted phone number ready to pass to the OTP verification screen.
Additional Fixes Along the Way
Added .replace(/\s/g, '') to strip any spaces from phone numbers
Fixed spacing issues between the "Personal Ledger" label and input fields
Resolved a TypeScript server restart issue
Added debug logging to trace the flow