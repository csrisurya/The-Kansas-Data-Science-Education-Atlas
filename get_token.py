from google_auth_oauthlib.flow import InstalledAppFlow
import json

SCOPES = ['https://www.googleapis.com/auth/gmail.send']

flow = InstalledAppFlow.from_client_secrets_file(
    'client_secret_892014745986-r30r6dg41qth1mfn4uijkfnvjq43rg0u.apps.googleusercontent.com.json',
    SCOPES
)

creds = flow.run_local_server(port=0)

print("\n=== COPY THESE VALUES TO RENDER ===")
print(f"GMAIL_CLIENT_ID={creds.client_id}")
print(f"GMAIL_CLIENT_SECRET={creds.client_secret}")
print(f"GMAIL_REFRESH_TOKEN={creds.refresh_token}")