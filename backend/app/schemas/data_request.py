from typing import List, Literal, Optional

from pydantic import BaseModel, EmailStr, field_validator


class DataRequestSchema(BaseModel):
    """Schema for incoming data / report requests from the frontend."""

    request_type: Literal["report", "dataset"]

    # Dataset requests
    datasets: List[str] = []

    # Report requests
    report_type: Optional[str] = None

    counties: Optional[List[str]] = None
    geographic_scope: str  # "all", "specific", "region"
    data_format: str  # "CSV", "Excel", "JSON", "PDF", "PowerPoint"
    intended_use: str
    name: str
    email: EmailStr
    organization: Optional[str] = None
    agree_to_terms: bool

    @field_validator("agree_to_terms")
    @classmethod
    def must_agree(cls, v: bool) -> bool:
        if not v:
            raise ValueError("You must agree to the citation terms.")
        return v

    @field_validator("intended_use")
    @classmethod
    def intended_use_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Intended use description is required.")
        return v

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name is required.")
        return v


class DataRequestResponse(BaseModel):
    """Response returned after a data request is submitted."""

    request_id: str
    status: str = "pending"
    message: str = "Request received. You will receive a download link via email within 2 business days."


class ReportGenerateRequest(BaseModel):
    """Schema for on-demand report generation."""

    report_type: str  # "County Profile", "Regional Summary", etc.
    counties: Optional[List[str]] = None
    all_counties: bool = True
    sections: List[str] = []
    output_format: Literal["PDF", "PowerPoint"] = "PDF"


class ReportGenerateResponse(BaseModel):
    """Response returned after report generation."""

    filename: str
    download_url: str
    format: str
    message: str = "Report generated successfully."
