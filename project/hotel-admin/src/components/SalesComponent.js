import React, { useEffect, useState } from "react";
import { Input, Modal } from "./CustomTheme";
import MultiColorSpinner from "./SvgIcons/LoadingIcon";
import { http } from "../helper/http";
import dayjs from "dayjs";
const Spinner = () => (
  <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
);
const SaleCard = ({
  title,
  identifier,
  name,
  status,
  price,
  refunded,
  buyDate,
  customerName,
  customerPhone,
  fee,
  policy,
}) => {
  return (
    <div className="w-[550px] bg-white rounded-[13px] flex justify-between items-start p-4">
      <div className="flex flex-col gap-1">
        <div className="text-[#93999A] font-dm font-bold text-[18px] capitalize">
          {title}
        </div>
        <div className="text-[#93999A] font-dm font-bold text-[18px] capitalize">
          {identifier}
        </div>
        <div className="text-[#93999A] font-dm font-bold text-[18px] capitalize">
          {name}
        </div>
        <div
          className={`${
            status ? "text-[#109857]" : "text-[#F00]"
          } font-dm font-bold text-[18px] capitalize`}
        >
          {status ? "Reserved" : "Cancelled"}
        </div>
        {!status && (
          <div className="text-[#F00] font-dm font-bold text-[18px] capitalize">
            Refunded ${refunded}
          </div>
        )}
      </div>
      <div className="text-right">
        <div className="text-[#109857] font-dm font-bold text-[18px] capitalize">
          ${price + fee}
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-[#93999A] font-dm font-bold text-[10px] capitalize">
            Paid With Debit Card
          </div>
          <div className="text-[#93999A] font-dm font-bold text-[10px] capitalize">
            Payment Status: Sunccessful
          </div>
          <div className="text-[#93999A] font-dm font-bold text-[10px] capitalize">
            Date: {dayjs(buyDate).format("MMMM DD YYYY")}
          </div>
          <div className="text-[#93999A] font-dm font-bold text-[10px] capitalize">
            {customerName}
          </div>
          <div className="text-[#93999A] font-dm font-bold text-[10px] capitalize">
            {customerPhone}
          </div>
          <div className="text-[#93999A] font-dm font-bold text-[10px] capitalize">
            Price: ${price}
          </div>
          <div className="text-[#93999A] font-dm font-bold text-[10px] capitalize">
            Tax & Fee: ${fee}
          </div>
          <div className="text-[#93999A] font-dm font-bold text-[10px] capitalize">
            {policy}
          </div>
        </div>
      </div>
    </div>
  );
};
const SalesComponent = () => {
  const [identifier, setIdentifer] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [preSelectedMonths, setPreSelectedMonths] = useState([]);
  const [identifierLoading, setIdentifierLoading] = useState(false);
  const [salesLoading, setSalesLoading] = useState(false);
  const [matchedType, setMatchedType] = useState("");
  const [totalSales, setTotalSales] = useState(0);
  const [totalFees, setTotalFees] = useState(0);
  const [totalRefunds, setTotalRefunds] = useState(0);
  const [saleData, setSaleData] = useState([]);
  const [isUser, setIsUser] = useState(false);
  const [error, setError] = useState({
    identifier: false,
  });

  useEffect(() => {
    const name = sessionStorage.getItem("name");
    if (name) {
      setIdentifer(name);
      setIsUser(true);
    } else {
      setIdentifer("");
      setIsUser(false);
    }
  }, []);
  useEffect(() => {
    if (identifier?.length === 6) {
      setIdentifierLoading(true);
      http.get(`/admin/identifier_matched/${identifier}`).then((res) => {
        if (res.data.message === "Identifier Matched") {
          setMatchedType(res.data.type);
          setPreSelectedMonths(res.data.monthLists);
          setError({ ...error, identifier: false });
        } else {
          setError({ ...error, identifier: true });
        }
        setIdentifierLoading(false);
      });
    } else {
      initialData();
    }
  }, [identifier]);
  const initialData = () => {
    setSelectedMonth("");
    setPreSelectedMonths([]);
    setIdentifierLoading(false);
    setMatchedType("");
    setTotalSales(0);
    setTotalFees(0);
    setTotalRefunds(0);
    setSaleData([]);
    setSalesLoading(false);
    setError({
      identifier: false,
    });
  };
  const confirmSelectMonth = (value) => {
    setSalesLoading(true);
    setSelectedMonth(value);
    http
      .post("/admin/get_sales", {
        identifier,
        selectedMonth: value[0],
        matchedType,
      })
      .then((res) => {
        if (res.data.message === "Sales Fetched") {
          setTotalSales(res.data.totalSales);
          setTotalFees(res.data.totalFees);
          setTotalRefunds(res.data.totalRefunds);
          setSaleData(res.data.data);
          setSalesLoading(false);
        }
        setSalesLoading(false);
      });
  };
  return (
    <div className="flex flex-col gap-3 pb-5">
      <h1 className="text-4xl text-black text-left font-abril font-semibold mb-11">
        {"Sales"}
      </h1>
      <div className="flex flex-col gap-5">
        <div className="flex gap-3 items-center">
          <Input
            type="text"
            placeholder="Hotel/Spot Id"
            value={identifier}
            onChange={(e) => setIdentifer(e.target.value)}
            disabled={isUser}
          />
          {identifierLoading && <MultiColorSpinner />}
          {identifier?.length === 6 &&
            error.identifier &&
            !identifierLoading && (
              <p className="text-red-500 text-[12px] font-bold">
                Invalid Identifier
              </p>
            )}
          {identifier?.length === 6 &&
            !error.identifier &&
            !identifierLoading && (
              <p className="text-green-500 text-[12px] font-bold capitalize">
                {matchedType} Identifier Matched
              </p>
            )}
        </div>
        {preSelectedMonths.length > 0 && (
          <Modal
            placeholder={"Select Month"}
            values={selectedMonth}
            options={preSelectedMonths}
            isMultiple={false}
            onChange={(value) => confirmSelectMonth(value)}
          />
        )}
        {salesLoading && <Spinner />}
        {!salesLoading && selectedMonth && identifier && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-4">
              <div className="min-w-[170px] h-[60px] bg-white rounded-[13px] flex justify-center items-center text-[#109857] text-[18px] font-dm font-bold">
                ${totalSales}
              </div>
              <div className="min-w-[170px] h-[60px] bg-white rounded-[13px] flex justify-center items-center text-[#109857] text-[18px] font-dm font-bold">
                ${totalFees}
              </div>
              <div className="min-w-[170px] h-[60px] bg-white rounded-[13px] flex justify-center items-center text-[#F00] text-[18px] font-dm font-bold">
                ${totalRefunds}
              </div>
            </div>
            <div className="flex flex-col gap-y-4">
              {saleData.map((sale, index) => (
                <SaleCard
                  key={index}
                  title={sale.hotelId ? sale.hotelId.name : sale.spotId.name}
                  identifier={
                    sale.hotelId
                      ? sale.hotelId.identifier
                      : sale.spotId.identifier
                  }
                  name={sale.roomId ? sale.roomId.name : sale.spotId.name}
                  status={!sale.cancellationStatus}
                  price={sale.priceAmount}
                  refunded={sale.refundAmount}
                  buyDate={sale.buyDate}
                  customerName={sale.userId.name || "Anonymous"}
                  customerPhone={sale.userId.phoneNumber || "Anonymous"}
                  fee={sale.feeAmount}
                  policy={
                    sale.roomId
                      ? sale.roomId.cancellationPolicy
                      : sale.ticketId.cancellationPolicy
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesComponent;
