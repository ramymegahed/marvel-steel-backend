import urllib.request
import urllib.parse
import urllib.error
import json

BASE_URL = "http://localhost:8000/api/v1"

def make_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    
    req_data = None
    if data:
        if headers.get("Content-Type") == "application/x-www-form-urlencoded":
            req_data = urllib.parse.urlencode(data).encode('utf-8')
        else:
            headers["Content-Type"] = "application/json"
            req_data = json.dumps(data).encode('utf-8')
            
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode('utf-8')}")
        return None

def run_test():
    # 1. Login
    login_data = {
        "username": "admin@marvelsteel.com",
        "password": "Admin123456"
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    token_resp = make_request("http://localhost:8000/api/v1/admin/login", method="POST", data=login_data, headers=headers)
    if not token_resp:
        print("Login failed")
        return
        
    token = token_resp.get("access_token")
    auth_headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Create Category
    cat_data = {"name": "Test Category", "description": "A testing category"}
    cat_resp = make_request(f"{BASE_URL}/admin/categories/", method="POST", data=cat_data, headers=auth_headers)
    cat_id = cat_resp.get("id") if cat_resp else 1
    
    # 3. Create Product
    prod_data = {
        "name": "Test Pricing Product",
        "description": "Verification of price and discount",
        "category_id": cat_id,
        "is_active": True
    }
    prod_resp = make_request(f"{BASE_URL}/admin/products/", method="POST", data=prod_data, headers=auth_headers)
    prod_id = prod_resp.get("id") if prod_resp else 1
    
    # 4. Create ProductSize
    size_data = {
        "name": "Large",
        "price": 100.0,
        "discount_price": 80.0,
        "stock_quantity": 50
    }
    size_resp = make_request(f"{BASE_URL}/admin/products/{prod_id}/sizes", method="POST", data=size_data, headers=auth_headers)
    if not size_resp:
        return
    size_id = size_resp.get("id")
    print("Created Size:", size_resp)
    
    # 5. Add to Cart
    cart_item_data = {
        "product_id": prod_id,
        "size_id": size_id,
        "quantity": 1
    }
    cart = make_request(f"{BASE_URL}/cart/items", method="POST", data=cart_item_data)
    cart_id = cart.get("id")
    print("Added to cart, Cart response:", json.dumps(cart, indent=2))
    item_price_discount = cart["items"][0]["item_price"]
    print(f"Item Price with Discount: {item_price_discount} (Expected: 80.0)")
    
    # 6. Remove Discount
    update_data = {
        "discount_price": None
    }
    updated_size = make_request(f"{BASE_URL}/admin/products/sizes/{size_id}", method="PUT", data=update_data, headers=auth_headers)
    print("Updated Size:", updated_size)
    
    # 7. Check Cart Again
    cart2 = make_request(f"{BASE_URL}/cart/", method="GET", headers={"X-Cart-Id": cart_id})
    item_price_no_discount = cart2["items"][0]["item_price"]
    print(f"Item Price without Discount: {item_price_no_discount} (Expected: 100.0)")
    
    if item_price_discount == 80.0 and item_price_no_discount == 100.0:
        print("VERIFICATION SUCCESSFUL!")
    else:
        print("VERIFICATION FAILED!")

if __name__ == "__main__":
    try:
        run_test()
    except Exception as e:
        print(f"Error: {e}")
