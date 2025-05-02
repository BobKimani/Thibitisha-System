import csv
import random
import os

def generate_sample_csv(filename="sample_input.csv", total_records=100):
    banks = ["01", "02", "03", "04"]
    with open(filename, mode='w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=["account", "bank_code", "amount", "reference_id"])
        writer.writeheader()

        for i in range(total_records):
            # Randomly generate valid or invalid account numbers
            if random.random() < 0.7:  # 70% valid accounts
                account = ''.join([str(random.randint(0, 9)) for _ in range(10)])
            else:
                account = ''.join(random.choices("abc123XYZ890", k=random.randint(5, 12)))  # Invalid

            row = {
                "account": account,
                "bank_code": random.choice(banks),
                "amount": random.randint(100, 10000),
                "reference_id": f"ref{i+1}"
            }
            writer.writerow(row)

    print(f"✅ {total_records} records written to {os.path.abspath(filename)}")

if __name__ == "__main__":
    generate_sample_csv()
