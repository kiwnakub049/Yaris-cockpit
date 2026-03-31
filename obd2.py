import obd
import time
import os
import sys

# ==========================================
# 1. ฟังก์ชันจัดการหน้าจอและแปลงค่า
# ==========================================

def clear_screen():
    # สั่งล้างหน้าจอ (Linux/Pi ใช้ clear)
    os.system('clear')

def format_value(response):
    """
    ฟังก์ชันแปลงค่าให้เป็นข้อความสวยๆ และป้องกัน Error
    """
    if response.is_null():
        return "-"

    val = response.value

    # กรณีที่ 1: เป็นค่าตัวเลขที่มีหน่วย (Quantity) เช่น RPM, Speed, Temp
    # เราต้องเช็คก่อนว่ามี attribute 'magnitude' ไหม
    if hasattr(val, 'magnitude'):
        try:
            # ดึงหน่วยออกมา (บางเวอร์ชันใช้ .units บางอันใช้ .unit)
            if hasattr(val, 'units'):
                unit_str = str(val.units)
            elif hasattr(val, 'unit'):
                unit_str = str(val.unit)
            else:
                unit_str = ""
            
            # คืนค่าเป็นทศนิยม 2 ตำแหน่ง + หน่วย
            return f"{val.magnitude:.2f} {unit_str}"
        except:
            # ถ้าดึงหน่วยไม่ได้จริงๆ ให้คืนค่าดิบไปเลย
            return str(val)

    # กรณีที่ 2: เป็นข้อความ หรือตัวเลขไม่มีหน่วย (เช่น Fuel Type, Status)
    return str(val)

# ==========================================
# 2. เริ่มการเชื่อมต่อ
# ==========================================

print("--- TOYOTA FULL SCANNER ---")
print("กำลังเชื่อมต่อกับรถ... (Connecting)")

try:
    connection = obd.OBD() # เชื่อมต่ออัตโนมัติ
except Exception as e:
    print(f"Error: หาอุปกรณ์ไม่เจอ ({e})")
    sys.exit()

if not connection.is_connected():
    print("เชื่อมต่อ Adapter ได้ แต่คุยกับรถไม่ได้ (ตรวจสอบ: บิดกุญแจ ON หรือยัง?)")
    sys.exit()

print("เชื่อมต่อสำเร็จ! กำลังสแกนหาเซนเซอร์ทั้งหมด...")

# ==========================================
# 3. สแกนหาคำสั่งที่รถรองรับ (Auto Scan)
# ==========================================

watch_list = []
# วนลูปเช็คคำสั่งทั้งหมดที่ Library รู้จัก
for cmd in connection.supported_commands:
    # เลือกเฉพาะ Mode 01 (Live Data) และตัดพวกคำสั่งเช็ค PID ออก
    if cmd.mode == 1 and cmd.name not in ['PIDS_A', 'PIDS_B', 'PIDS_C']:
        watch_list.append(cmd)

# เรียงลำดับชื่อเซนเซอร์ A-Z
watch_list.sort(key=lambda x: x.name)

print(f"เจอเซนเซอร์ทั้งหมด: {len(watch_list)} รายการ")
time.sleep(2)

# ==========================================
# 4. ลูปแสดงผล (Main Loop)
# ==========================================

try:
    while True:
        # ใช้ buffer เก็บข้อความที่จะปริ้นท์ เพื่อลดอาการจอกระพริบ
        output_buffer = []
        output_buffer.append(f"--- ALL SENSORS DATA ({len(watch_list)}) ---")
        output_buffer.append(f"{'SENSOR NAME':<30} | {'VALUE'}")
        output_buffer.append("-" * 50)

        # วนลูปดึงค่าทีละตัว
        for cmd in watch_list:
            # ส่งคำสั่งไปถามรถ
            response = connection.query(cmd)
            
            # แปลงค่าผ่านฟังก์ชันกัน Error ของเรา
            val_str = format_value(response)
            
            # เพิ่มลงใน buffer
            output_buffer.append(f"{cmd.name:<30} | {val_str}")

        output_buffer.append("-" * 50)
        output_buffer.append("กด Ctrl+C เพื่อออก")

        # แสดงผลทีเดียวตูมเดียว
        clear_screen()
        print("\n".join(output_buffer))
        
        # ไม่ต้องใส่ sleep เยอะ เพราะการวนลูป 24 ตัวกินเวลาอยู่แล้ว
        # ใส่ไว้นิดเดียวเพื่อให้ CPU ได้พักบ้าง
        time.sleep(0.1)

except KeyboardInterrupt:
    print("\nหยุดการทำงาน... (Disconnected)")
    connection.close()